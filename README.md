# venkat

This is the README for the VS Code extension "venkat". 

It runs the example file up to the current line (or the selection) and displays the result of that last line in a comment after or for multi-line results below (or as info message).

It is inspired by Venkat Subramaniam's use of Textmate tooltips for [code execution results](http://blog.agiledeveloper.com/2014/10/running-in-textmate.html) which is great for presentations.

## Features

* execute selection or code up to current line
* Language support for python, javascript, ruby, java
* supports multiline outputs
* selects result, so can be deleted or copied with a single keystroke
* show result as comment or as info message
* configurable extra languages

![](images/venkat-demo.gif)

## Requirements

An interpreter for the languages used, should be installed.

* python: python
* javascript : node
* ruby: ruby
* java: jshell -s
* kotlin: kotlin
* typescript: ts-node
* php: php -f

## Configuration

* resultAsComment : boolean, default true - insert the result as comments, otherwise show them as info message

* languages : structure for languages with entries for `extension, comment, executable, output, exit`, where output contains a `${expression}` placeholder, and exit optionally contains code to end the script execution.

Here are two examples:

```json
    "venkat.languages": {
        "python": {
            "comment": "#",
            "executable": "python",
            "extension": "py",
            "output": "print(${expression})"
        },
        "java": {
            "comment": "//",
            "executable": "jshell -s ",
            "extension": "java",
            "output": "System.out.println(${expression});",
            "exit": "/exit"
        }
    }
```