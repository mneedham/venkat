# venkat

This is the README for the VS Code extension "venkat". 
It runs the example file up to the current line and displays the result of that last line in a comment after or for multi-line results below.

It is inspired by Venkat Subramaniam's use of Textmate tooltips for [code execution results](http://blog.agiledeveloper.com/2014/10/running-in-textmate.html) which is great for presentations.

## Features

* Language support for python, javascript, ruby, java
* supports multiline outputs
* selects result, so can be deleted or copied with a single keystroke

![](images/venkat-demo.gif)

## Requirements

An interpreter for the languages used, should be installed.

* python: python
* javascript : node
* ruby: ruby
* java: jshell
* kotlin: kotlin
* typescript: ts-node
* php: php


## Known Issues

Barely works, not much error handling.

## Release Notes

### 0.0.8

* handle comment ending last line
* code cleanup

### 0.0.7

* Language support for python, javascript, typescript, ruby, java, kotlin, php
* better handling of result comments esp. for multiline
* multiline results on new line
* Better handling of file extensions
* show all errors

### 0.0.1

Initial release of venkat, only works with python for now.