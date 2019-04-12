# web-feed

A configurable, plugin based, web feed written in NodeJS

## Installation

Clone the repository

`cd web-feed`

`npm install` or `npm install -g` to run it globally

## Usage

The application is used through console interface by adding custom plugins and using their commands to retrieve data from the web.
Each plugin must follow a specific interface, illustrated in the example plugin.[TODO]

It can also be used as a daemon through I/O messages. This is mainly to communicate with
a external app (chrome extension in this case).

## Plugin API

[TODO]

## CLI API

### install

Install a plugin into the application

`web-feed install path/to/plugin-module`

### remove

Remove a plugin from the application

`web-feed remove plugin-module`

### list

List the plugins installed

`web-feed list`

### run

Run the specified plugin command with the given options.
The results are displayed on the standard output in json format.

`web-feed run plugin-id [..options]`

### daemon

Start the daemon.
Input and output must be sent through the standard input
and read through standard err streams.[More info later]

`web-feed daemon`

### plugin-info

Display the plugin api specified by its own configuration file
[TODO]
