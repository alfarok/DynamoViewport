using System;
using System.ComponentModel;
using CefSharp;
using System.Windows.Controls;
using ViewportViewExtension.ViewModels;


namespace ViewportViewExtension.Views
{
    public partial class ViewportView : UserControl
    {
        public ViewportView( ViewportWindowViewModel vm )
        {
            if (vm == null) return;

            this.DataContext = vm;

            // CEF will already by loaded by sandbox or revit
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

            // When view model is updated call javascript update function
            vm.PropertyChanged += ExecuteJavascript;
        }

        // Update geometry when view model new changes
        private async void ExecuteJavascript(object sender, EventArgs e)
        {
            PropertyChangedEventArgs eventArgs = e as PropertyChangedEventArgs;
            string changedProperty = eventArgs.PropertyName;

            if (changedProperty == "RenderData")
            {
                ViewportWindowViewModel vm = sender as ViewportWindowViewModel;
                string jsonString = vm.RenderData();

                if (!string.IsNullOrWhiteSpace(jsonString))
                {
                    JavascriptResponse response = await Browser.EvaluateScriptAsync(jsonString);
                }
            }
        }
    }
}