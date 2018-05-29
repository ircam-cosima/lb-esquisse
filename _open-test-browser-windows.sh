#!/bin/bash

MAX=1;
URL=www.google.com;

for (( i=0; i<=$MAX; i+=1 )); do
    echo "$i";
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --incognito --new-window "$URL";
done;
