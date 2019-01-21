# DynamoViewport
DynamoViewport is a Dynamo view extension that instantiates a CEF browser window. The browser runs a three.js scene that displays Dynamo geometry via the render package data.  This project began as an experiment originally researched during a 2017 recharge sprint.  It is a WIP repo in early exploratory development.  Feel free to fork and make pull requests!

[Viewport Demo Video](https://youtu.be/qXHMFWbzC-0)

![IMG](https://github.com/alfarok/DynamoViewport/blob/CEF_Embedded/images/DynamoViewportExample.JPG?raw=true)

![IMG](https://github.com/alfarok/DynamoViewport/blob/CEF_Embedded/images/DynamoViewportEmbedded.gif?raw=true)

### CEF Sharp
CEF is either initialized by 
- DynamoCore in DynamoSandbox
- Revit in Dynamo for Revit 2020+
- Possibly another host application or plugin that is using CEF in the same process

Dynamo Viewport is exclusively built against DynamoCore v2.0 as GPU rendering was disabled during CEF initiatization in Dynamo 1.3.X and older

### Building/Installing Viewport
- Clone repo
- Build against x64 architecture (will fail if not specified)
- This should populate the `C:\..\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\DynamoPackage\Viewport` package folder.  An attempt is also made to copy this package folder to `C:\Users\USERNAME\AppData\Roaming\Dynamo\Dynamo Core\2.2\packages` and will cause a build error if this path is not present.  You can upgrade accordingly by modifying [this line](https://github.com/alfarok/DynamoViewport/blob/CEF_Embedded/src/ViewportViewExtension/ViewportViewExtension/ViewportViewExtension.csproj#L217). You can also add/replace this with `C:\Users\USERNAME\AppData\Roaming\Dynamo\Dynamo Revit\2.2\packages` to copy the package to your Revit packages as well.

### Running Dynamo
- Run
`C:\..\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug\DynamoSandbox.exe`

### Running Viewport
- From the main Dynamo toolbar View -> Launch Viewport

### Debugging
`http://localhost:8088/`
