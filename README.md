# DynamoViewport
DynamoViewport is a Dynamo view extension that instantiates a CEF browser window. The browser runs a three.js scene that displays Dynamo geometry via the render package data.

[Viewport Demo Video](https://youtu.be/qXHMFWbzC-0)

This project began as an experiment originally researched during a 2017 recharge sprint.  It is a WIP repo in early exploratory development.  Feel free to fork and make pull requests!

### Building Dynamo
CEF is either initialized by 
- DynamoCore in DynamoSandbox
- Revit in Dynamo for Revit 2020+
- Possibly another host application or plugin that is using CEF in the same process

Dynamo Viewport is exclusively built against DynamoCore v2.0 as GPU rendering was disabled during CEF initiatization in Dynamo 1.3.X and older

### Building/Installing Viewport
- Clone repo
- Build against x64 architecture (will fail if not specified)
- This should populate the `C:\..\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\DynamoPackage\Viewport` package folder.  This folder is also copied to `C:\Users\USERNAME\AppData\Roaming\Dynamo\Dynamo Core\2.0\packages` (Add/Replace with `C:\Users\USERNAME\AppData\Roaming\Dynamo\Dynamo Revit\2.0\packages` to copy in postbuild to Revit)

### Running Dynamo
- Run
`C:\..\REPO_LOCATION\Dynamo\bin\AnyCPU\Debug\DynamoSandbox.exe`

### Running Viewport
- From the main Dynamo toolbar View -> Launch Viewport

### Debugging
`http://localhost:8088/`
