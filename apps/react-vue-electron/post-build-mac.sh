#!/usr/bin/env bash

# This script is executed after the build of the Intel Mac version.

# Find the file that starts with react-vue-electron-x.y.z and extract the version x.y.z
version=$(grep version package.json | sed 's/["a-z :,]//g')
echo "Version found: $version"

platform="mac"

mkdir -p dist/React-vue-electron-$version

cp dist/react-vue-electron-$version.dmg  dist/React-vue-electron-$version/.

mkdir -p dist/$platform-$version

mv dist/builder-debug.yml                   dist/$platform-$version/.
mv dist/builder-effective-config.yaml       dist/$platform-$version/.
mv dist/react-vue-electron-$version-mac.zip          dist/$platform-$version/.
mv dist/react-vue-electron-$version-mac.zip.blockmap dist/$platform-$version/.
mv dist/react-vue-electron-$version.dmg              dist/$platform-$version/.
mv dist/react-vue-electron-$version.dmg.blockmap     dist/$platform-$version/.
mv dist/latest-mac.yml                      dist/$platform-$version/.
mv dist/mac                                 dist/$platform-$version/.
