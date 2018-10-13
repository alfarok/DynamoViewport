using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using CefSharp;
using CefSharp.Wpf;
using Dynamo.Extensions;
using Dynamo.Logging;
using Dynamo.Models;
using Dynamo.Search;
using Dynamo.Search.SearchElements;
using Dynamo.ViewModels;
using Dynamo.Wpf.Interfaces;
using Dynamo.Wpf.ViewModels;
using Dynamo.Wpf.Extensions;
using Dynamo.Core;
using ViewportViewExtension.Views;
using ViewportViewExtension.ViewModels;

namespace ViewportViewExtension
{
    // Event Controller Interface
    public interface IEventController
    {
        void On(string eventName, object callback);
        void RaiseEvent(string eventName, params object[] parameters);
    }

    // Event controller Class
    public class EventController : IEventController
    {
        private object contextData = null;
        private Dictionary<string, List<IJavascriptCallback>> callbacks = new Dictionary<string, List<IJavascriptCallback>>();

        public void On(string eventName, object callback)
        {
            List<IJavascriptCallback> cblist;
            if (!callbacks.TryGetValue(eventName, out cblist))
            {
                cblist = new List<IJavascriptCallback>();
            }
            cblist.Add(callback as IJavascriptCallback);
            callbacks[eventName] = cblist;
        }

        [JavascriptIgnore]
        public void RaiseEvent(string eventName, params object[] parameters)
        {
            List<IJavascriptCallback> cblist;
            if (callbacks.TryGetValue(eventName, out cblist))
            {
                foreach (var cbfunc in cblist)
                {
                    if (cbfunc.CanExecute)
                    {
                        cbfunc.ExecuteAsync(parameters);
                    }
                }
            }
        }

        /// <summary>
        /// Gets details view context data, e.g. packageId if it shows details of a package
        /// </summary>
        public object DetailsViewContextData
        {
            get { return contextData; }
            set
            {
                contextData = value;
                this.RaiseEvent("detailsViewContextDataChanged", contextData);
            }
        }
    }

    /// <summary>
    /// This class holds methods and data to be called from javascript
    /// </summary>
    public class ViewportViewController : EventController, IDisposable
    {
        private Window dynamoWindow;
        private ViewLoadedParams viewLoadedParams;
        private string address;
        private ICommandExecutive commandExecutive;
        private DynamoViewModel dynamoViewModel;
        private ResourceHandlerFactory resourceFactory;
        private IDisposable observer;
        private ChromiumWebBrowser browser;

        // TODO remove this when we can control the library state from Dynamo more precisely.
        private bool disableObserver = false;

        /// <summary>
        /// Creates ViewportViewController
        /// </summary>
        /// <param name="dynamoView">DynamoView hosting library component</param>
        /// <param name="commandExecutive">Command executive to run dynamo commands</param>
        internal ViewportViewController(Window dynamoView, ICommandExecutive commandExecutive, ViewLoadedParams vParams,  string address)
        {
            this.dynamoWindow = dynamoView;
            this.viewLoadedParams = vParams;
            this.address = address;
            dynamoViewModel = dynamoView.DataContext as DynamoViewModel;

            this.commandExecutive = commandExecutive;
            //InitializeResourceStreams(dynamoViewModel.Model, customization);
            dynamoWindow.StateChanged += DynamoWindowStateChanged;
            dynamoWindow.SizeChanged += DynamoWindow_SizeChanged;
        }

        //if the window is resized toggle visibility of browser to force redraw
        private void DynamoWindow_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            browser.InvalidateVisual();
        }

        private void toggleBrowserVisibility(ChromiumWebBrowser browser)
        {
            if (browser != null)
            {
                browser.InvalidateVisual();
            }
        }

        //if the dynamo window is minimized and then restored, force a layout update.
        private void DynamoWindowStateChanged(object sender, EventArgs e)
        {
            browser.InvalidateVisual();
        }

        /// <summary>
        /// Call this method to create a new node in Dynamo canvas.
        /// </summary>
        /// <param name="nodeName">Node creation name</param>
/*
        public void CreateNode(string nodeName)
        {
            dynamoWindow.Dispatcher.BeginInvoke(new Action(() =>
            {
                //if the node we're trying to create is a customNode, lets disable the eventObserver.
                // this will stop the libraryController from refreshing the libraryView on custom node creation.
                var resultGuid = Guid.Empty;
                if (Guid.TryParse(nodeName, out resultGuid))
                {
                    this.disableObserver = true;
                }
                //Create the node of given item name
                var cmd = new DynamoModel.CreateNodeCommand(Guid.NewGuid().ToString(), nodeName, -1, -1, true, false);
                commandExecutive.ExecuteCommand(cmd, Guid.NewGuid().ToString(), ViewExtension.ExtensionName);
                LogEventsToInstrumentation(CreateNodeInstrumentationString, nodeName);

                this.disableObserver = false;
            }));
        }
*/

        /// <summary>
        /// Creates and add the library view to the WPF visual tree
        /// </summary>
        /// <returns>LibraryView control</returns>
        internal ViewportView AddViewportView()
        {
            var sidebarGrid = dynamoWindow.FindName("sidebarGrid") as Grid;

            var model = new ViewportWindowViewModel(this.viewLoadedParams, this.address);
            var view = new ViewportView(model); // This crashes

            var browser = view.Browser;
            this.browser = browser;
            sidebarGrid.Children.Clear(); // Clear library contents
            sidebarGrid.Children.Add(view);
            browser.RegisterAsyncJsObject("controller", this);
            RegisterResources(browser);

            view.Loaded += OnViewportViewLoaded;
            browser.SizeChanged += Browser_SizeChanged;
            browser.LoadError += Browser_LoadError;

            // TODO - this was added Fall 2017 due to issues with 
            // library failing to load due to timing issues. 
            /*
                        //wait for the browser to load before setting the resources
                        browser.LoadingStateChanged += (sender, args) =>
                        {
                            //Wait for the Page to finish loading
                            if (args.IsLoading == false)
                            {
                                RegisterResources(browser);
                            }
                        };
            */
            return view;
        }

        private void Browser_LoadError(object sender, LoadErrorEventArgs e)
        {
            System.Diagnostics.Trace.WriteLine("*****Chromium Browser Messages******");
            System.Diagnostics.Trace.Write(e.ErrorText);
            this.dynamoViewModel.Model.Logger.LogError(e.ErrorText);
        }

        //if the browser window itself is resized, toggle visibility to force redraw.
        private void Browser_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            browser.InvalidateVisual();
        }

        private Stream LoadResource(string url)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var textStream = assembly.GetManifestResourceStream(url);
            return textStream;
        }

        private void OnViewportViewLoaded(object sender, RoutedEventArgs e)
        {
            var viewportView = sender as ViewportView;
#if DEBUG
            var browser = viewportView;
            //browser.ConsoleMessage += OnBrowserConsoleMessage;
#endif
        }

        private void OnBrowserConsoleMessage(object sender, ConsoleMessageEventArgs e)
        {
            System.Diagnostics.Trace.WriteLine("*****Chromium Browser Messages******");
            System.Diagnostics.Trace.Write(e.Message);
        }

        private void InitializeResourceStreams(DynamoModel model, ViewportWindowViewModel customization)
        {
            //TODO: Remove the parameter after testing.
            //For testing purpose.
            resourceFactory = new ResourceHandlerFactory(model.Logger);

            //Register the resource stream registered through the ViewportWindowViewModel
            /*
            foreach (var item in customization.Resources)
            {
                OnResourceStreamRegistered(item.Key, item.Value);
            }
            */

            //Setup the event handler for resource registration
            //customization.ResourceStreamRegistered += OnResourceStreamRegistered;

            resourceFactory.RegisterProvider("dist",
                new DllResourceProvider("http://localhost/dist",
                    "ViewportViewExtension.Resources"));

            {
                var url = "http://localhost/index.html";
                var resource = "ViewportViewExtension.Resources.index.html";
                var stream = LoadResource(resource);
                resourceFactory.RegisterHandler(url, ResourceHandler.FromStream(stream));
            }
        }

        private void OnResourceStreamRegistered(string key, Stream value)
        {
            Uri url = new Uri(key, UriKind.RelativeOrAbsolute);
            if (!url.IsAbsoluteUri)
                url = new Uri(new Uri("http://localhost"), url);

            var extension = Path.GetExtension(key);
            var handler = ResourceHandler.FromStream(value, ResourceHandler.GetMimeType(extension));
            resourceFactory.RegisterHandler(url.AbsoluteUri, handler);
        }

        private void RegisterResources(ChromiumWebBrowser browser)
        {
            browser.ResourceHandlerFactory = resourceFactory;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected void Dispose(bool disposing)
        {
            if (!disposing) return;

            if (observer != null) observer.Dispose();
            observer = null;
            if (this.dynamoWindow != null)
            {
                dynamoWindow.StateChanged -= DynamoWindowStateChanged;
                dynamoWindow.SizeChanged -= DynamoWindow_SizeChanged;
                dynamoWindow = null;
            }
            if (this.browser != null)
            {
                browser.SizeChanged -= Browser_SizeChanged;
                browser.LoadError -= Browser_LoadError;
                browser.Dispose();
                browser = null;
            }
        }
    }
}