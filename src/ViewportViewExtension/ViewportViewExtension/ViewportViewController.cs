﻿using System;
using System.Collections.Generic;
using System.Windows;
using CefSharp;
using CefSharp.Wpf;
using Dynamo.Extensions;
using Dynamo.ViewModels;
using Dynamo.Wpf.Extensions;
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
        private DynamoViewModel dynamoViewModel;
        private IDisposable observer;
        private ChromiumWebBrowser browser;

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

            dynamoWindow.StateChanged += DynamoWindowStateChanged;
            dynamoWindow.SizeChanged += DynamoWindow_SizeChanged;
        }

        // If the window is resized toggle visibility of browser to force redraw
        private void DynamoWindow_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            browser.InvalidateVisual();
        }

        // If the dynamo window is minimized and then restored, force a layout update.
        private void DynamoWindowStateChanged(object sender, EventArgs e)
        {
            browser.InvalidateVisual();
        }

        /// <summary>
        /// Creates and add the library view to the WPF visual tree
        /// </summary>
        /// <returns>LibraryView control</returns>
        internal ViewportView AddViewportToExtensionsPanel(IViewExtension ext, ViewLoadedParams p)
        {
            var model = new ViewportWindowViewModel(this.viewLoadedParams, this.address);
            var view = new ViewportView(model);

            var browser = view.Browser;
            this.browser = browser;

            p.AddToExtensionsSideBar(ext, view);

            browser.RegisterAsyncJsObject("controller", this);

            view.Loaded += OnViewportViewLoaded;
            browser.SizeChanged += Browser_SizeChanged;
            browser.LoadError += Browser_LoadError;

            return view;
        }

        private void Browser_LoadError(object sender, LoadErrorEventArgs e)
        {
            System.Diagnostics.Trace.WriteLine("*****Chromium Browser Messages******");
            System.Diagnostics.Trace.Write(e.ErrorText);
            this.dynamoViewModel.Model.Logger.LogError(e.ErrorText);
        }

        // If the browser window itself is resized, toggle visibility to force redraw.
        private void Browser_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            browser.InvalidateVisual();
        }

        private void OnViewportViewLoaded(object sender, RoutedEventArgs e)
        {
            var viewportView = sender as ViewportView;
#if DEBUG
            // Debug console
            this.browser.ShowDevTools();
            this.browser.ConsoleMessage += OnBrowserConsoleMessage;
#endif
        }

        private void OnBrowserConsoleMessage(object sender, ConsoleMessageEventArgs e)
        {
            System.Diagnostics.Trace.WriteLine("*****Chromium Browser Messages******");
            System.Diagnostics.Trace.Write(e.Message);
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