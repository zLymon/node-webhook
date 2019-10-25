#!/bin/bash
echo "=== Get the shell options ==="
REPOSITORY=
TAG=
PROJECT_DIR=
while getopts "r:t:p:" opt; do
  case $opt in
    r)
      REPOSITORY=$OPTARG
      ;;
    t)
      TAG=$OPTARG
      ;;
    p)
      PROJECT_DIR=$OPTARG
      ;;
  esac
done

echo "=== Shell options ==="
echo "REPOSITORY：$REPOSITORY"
echo "TAG：$TAG"
echo "PROJECT_DIR: $PROJECT_DIR"

cd $PROJECT_DIR
if [ ! -d $REPOSITORY ]; then
  echo "=== The repository isn't existing on your server, cloning the repository... ==="
  echo "=== Repository name: git@github.com:zLymon/$REPOSITORY.git ==="
  echo "=== The log of git in $PROJECT_DIR ==="
  git clone --progress git@github.com:zLymon/$REPOSITORY.git 2> gitlog
  echo "=== git clone success ==="
  cd $REPOSITORY
else
  cd $REPOSITORY
  echo "=== Enter repository folder && clean code for resolve code conflict... ==="
  git reset --hard origin/master
  git clean -f
  echo "=== Finish clean && pull master branch code ==="
  git pull origin master
fi
echo "=== Finish update the master branch code, Start to install dependencies && build dist ==="
# read the nginx config to get the port
BUILD_PORT=`cat default.conf | grep "listen" | grep -Eo "[0-9]{1,5}"`
npm install
npm run build
echo "=== Build Success && Start to build docker image ==="
docker build -t $REPOSITORY:$TAG .
echo "=== Detect the container is exist for prevent port conflict ==="
docker stop $REPOSITORY && docker rm $REPOSITORY
echo "=== Start to run container ==="
docker run -d -p $BUILD_PORT:$BUILD_PORT --name $REPOSITORY $REPOSITORY:$TAG
echo "Docker container run success!"