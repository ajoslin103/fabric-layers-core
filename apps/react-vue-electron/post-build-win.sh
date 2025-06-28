#!/usr/bin/env bash

# This script is executed after the build of the Windows version.

# Find the file that starts with react-vue-electron-x.y.z and extract the version
version=$(grep version package.json | sed 's/["a-z :,]//g')
echo "Version found: $version"

platform="win"

mkdir -p dist/React-vue-electron-$version

pushd dist
zip -ry react-vue-electron-$version-win-unpacked.zip win-unpacked
popd

cp dist/react-vue-electron-$version-setup.exe  dist/React-vue-electron-$version
mv dist/react-vue-electron-$version-win-unpacked.zip dist/React-vue-electron-$version

mkdir -p dist/$platform-$version

mv dist/builder-debug.yml                       dist/$platform-$version/.
mv dist/builder-effective-config.yaml           dist/$platform-$version/.
mv dist/react-vue-electron-$version-setup.exe            dist/$platform-$version/.
mv dist/react-vue-electron-$version-setup.exe.blockmap   dist/$platform-$version/.
mv dist/latest.yml                              dist/$platform-$version/.
mv dist/win-unpacked                            dist/$platform-$version/.
