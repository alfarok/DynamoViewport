using System;
using System.Windows;
using System.Windows.Controls;
using Dynamo.Wpf.Extensions;
using ViewportViewExtension.ViewModels;

namespace ViewportViewExtension
{
    /// <summary>
    /// This is a View Extension sample created during the 2017 Recharge.
    /// The goal is provide clarity and new documentation around creating
    /// extensions for Dynamo as there are currently very limited resources.
    /// The GitHub repo will include step by step instructions walking through
    /// the development process. Please feel free to make a PR adding any
    /// additional points that have been omitted.
    /// </summary>
    public class ViewportViewExtension : IViewExtension
    {
        // Create a variable for our menu item, this is how the
        // user will launch the pop-up window within Dynamo
        private MenuItem viewportMenuItem;

        public string PackagePath { get; set; }

        public void Dispose() { }

        public void Startup(ViewStartupParams p)
        {
            PackagePath = p.PathManager.DefaultPackagesDirectory;
        }

        public void Loaded(ViewLoadedParams p)
        {
            // Specify the text displayed on the menu item
            viewportMenuItem = new MenuItem { Header = "Launch Viewport" };

            // Define the behavior when menu item is clicked
            viewportMenuItem.Click += (sender, args) =>
            {
                var viewLoadedParams = p;
                var controller = new ViewportViewController(p.DynamoWindow, p.CommandExecutive, viewLoadedParams, PackagePath);
                controller.AddViewportView();
            };

            // add the menu item to our loaded parameters
            p.AddMenuItem(MenuBarType.View, viewportMenuItem);
        }

        public void Shutdown() { }

        public string UniqueId
        {
            get
            {
                return Guid.NewGuid().ToString();
            }
        }

        public string Name
        {
            get
            {
                return "Viewport View Extension";
            }
        }

    }
}
