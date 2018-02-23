# DynamoViewport
DynamoViewport is a Dynamo view extension that instantiates a CEF browser window. The browser runs a three.js scene that displays Dynamo geometry via the render package data.

[Viewport Demo Video](https://drive.google.com/open?id=1irry8GOvSZqlSht9lDSrmHmKUwnM_YEX)

This project began as an experiment originally researched during a 2017 recharge sprint.  It is a WIP repo in early exploratory development.  Feel free to fork and make pull requests!

### Building Dynamo
The Dynamo library is also a CEF application and determines which settings CEF is initialized with for any other instances that may get instantiated within the given Dynamo environment.  In this initialization the library disables GPU usage in CEF.  This means currently you need a custom build of [Dynamo](https://github.com/DynamoDS/Dynamo) to run Viewport. In order to enable GPU rendering comment out [this](https://github.com/DynamoDS/Dynamo/blob/master/src/LibraryViewExtension/Views/LibraryView.xaml.cs#L28) line in the Dynamo [source](https://github.com/DynamoDS/Dynamo) and rebuild.  Viewport is exclusively built against DynamoCore v2.0.

### Building Viewport
- Clone repo
- Build against x64 architecture (will fail if not specified)
- This should populate the `..\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\ViewportBuild` folder with 3 items required for the installation.

### Installing Viewport
- Copy the ViewportResources folder and ViewportViewExtension.dll from `C:\..\REPO_LOCATION\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\ViewportBuild`
to `C:\..\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug`
- Copy the Viewport_ViewExtensionDefinition.xml from `C:\..\REPO_LOCATION\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\Viewport_ViewExtensionDefinition.xml` to `C:\..\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug`

### Running Dynamo
- Run
`C:\..\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug\DynamoSandbox.exe`

### Running Viewport
- In the main Dynamo toolbar View -> Launch Viewport

### Debugging
`http://localhost:8088/`
