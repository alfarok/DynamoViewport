# DynamoViewport
DynamoViewport is a Dynamo view extension that instantiates a CEF browser window. The browser runs a three.js scene that displays Dynamo geometry via the render package data.

[Viewport Demo Video](https://drive.google.com/open?id=1irry8GOvSZqlSht9lDSrmHmKUwnM_YEX)

This project began as an experiment originally researched during a 2017 recharge sprint.  It is a WIP repo in early exploratory development.  Feel free to fork and make pull requests!

### Building Dynamo
The Dynamo library is also a CEF application and determines which settings CEF is initialized with for any other instances that may get instantiated within the given Dynamo environment.  In this initialization the library disables GPU usage in CEF.  This means currently you need a custom build of [Dynamo](https://github.com/DynamoDS/Dynamo) to run Viewport. In order to enable GPU rendering comment out [this](https://github.com/DynamoDS/Dynamo/blob/master/src/LibraryViewExtension/Views/LibraryView.xaml.cs#L28) line in the Dynamo [source](https://github.com/DynamoDS/Dynamo) and rebuild.  Viewport is exclusively built against DynamoCore v2.0.

### Building Viewport
- Clone repo
- In `ViewportWindow.xaml` update the `Address` property in cefsSharp:ChromiumWebBrowse ([line 25](https://github.com/alfarok/DynamoViewport/blob/master/src/ViewportViewExtension/ViewportViewExtension/ViewportWindow.xaml#L25)) with your clone directory
```xaml
<cefSharp:ChromiumWebBrowser Name="Browser" Address="C:\GIT_LOCATION\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\Resources\index.html" Grid.Row="0" Grid.Column="0" Grid.ColumnSpan="2"></cefSharp:ChromiumWebBrowser>
```
-build against x64 architecture (will fail if not specified)

### Installing Viewport
- Copy ViewportViewExtension.dll from
`C:\..\REPO_LOCATION\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\bin\x64\DebugOrRelease`
to `C:\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug`
- Copy Viewport_ViewExtensionDefinition.xml from `C:\..\REPO_LOCATION\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\Viewport_ViewExtensionDefinition.xml` to `C:\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug`

### Running Dynamo
- Run
`C:\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug\DynamoSandbox.exe`

### Running Viewport
- In the main Dynamo toolbar View -> Launch Viewport

### Debugging
`http://localhost:8088/`
