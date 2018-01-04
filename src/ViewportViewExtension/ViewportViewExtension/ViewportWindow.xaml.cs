﻿using System;
using System.Windows;
using System.Windows.Input;
using CefSharp;
using CefSharp.Wpf;
using System.Windows.Controls;
using System.Windows.Data;
using System.IO;

namespace ViewportViewExtension
{
    public partial class ViewportWindow : Window
    {
        public ViewportWindow( ViewportWindowViewModel vm )
        {
            if (!Cef.IsInitialized)
            {
                var settings = new CefSettings { RemoteDebuggingPort = 8088 };

                settings.RegisterScheme(new CefCustomScheme
                {
                    SchemeName = CefSharpSchemeHandlerFactory.SchemeName,
                    SchemeHandlerFactory = new CefSharpSchemeHandlerFactory()
                });

                Cef.Initialize(settings);
            }

            InitializeComponent();

            // when view model is updated call javascript update function
            if (vm == null) return;
            // TODO create new event - don't use PropertyChanged
            vm.PropertyChanged += ExecuteJavascript;

            // Center initial viewport window upon launch
            WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;

            ScriptTextBox.KeyDown += new KeyEventHandler(textBoxKeyDown);
        }

        private async void textBoxKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                if (!string.IsNullOrWhiteSpace(ScriptTextBox.Text))
                {
                    JavascriptResponse response = await Browser.EvaluateScriptAsync(ScriptTextBox.Text);
                }

                ScriptTextBox.Clear();
            }
        }

        // Update geometry when view model new changes
        private async void ExecuteJavascript(object sender, EventArgs e)
        {
            ViewportWindowViewModel vm = sender as ViewportWindowViewModel;
            string jsonString = vm.RenderData;

            if (!string.IsNullOrWhiteSpace(jsonString))
            {
                JavascriptResponse response = await Browser.EvaluateScriptAsync(jsonString);
            }
        }

        // Command line execution
        private async void ExecuteJavaScriptBtn_Click(object sender, RoutedEventArgs e)
        {
            if (/*Browser.CanExecuteJavascriptInMainFrame &&*/ !string.IsNullOrWhiteSpace(ScriptTextBox.Text))
            {
                JavascriptResponse response = await Browser.EvaluateScriptAsync(ScriptTextBox.Text);
            }

            // TODO - view history and active geometry
            ScriptTextBox.Clear();
        }
    }
}