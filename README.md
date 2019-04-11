# web-feed

A configurable, plugin based, web feed written in NodeJS

## Installation

[Temporary] Clone the repository and npm install.

## Usage

The application is used through console interface by adding custom plugins and using their commands to retrieve data from the web.
Each plugin must follow a specific interface, illustrated in the example plugin.[Not yet commited]

It can also be used as a daemon through I/O messages. This is mainly to communicate with
a external app (chrome extension in this case).

## CLI API

### add

Add a plugin to the application

`crawler add --module=path/to/plugin-module`

### remove

Remove a plugin from the application

`crawler remove --module=module-id`

### list

List the plugins installed

`crawler list`

### run

Run the specified plugin command with the given options.
The results are displayed on the standard output in json format.

`crawler run --plugin=plugin-id [..options]`

### daemon

Start the daemon.
Input and output must be sent through the standard input
and read through standard err streams.[More info later]

`crawler daemon`

### plugin-info

Display the plugin api specified by its own configuration file
[To be implemented]
