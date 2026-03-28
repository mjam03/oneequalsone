---
title: "Python, The System Path and how conda and pyenv manipulate it"
pubDate: 2021-11-05
description: "A deep dive into what happens when you type ‘python’ in a shell and how popular environment management tools manipulate this behaviour"
---

![](https://cdn-images-1.medium.com/max/800/0*mLaAtknLt9Z_lll9)

Photo by [Tudor Baciu](https://unsplash.com/@baciutudor?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

The System Path (on Mac/Linux `echo $PATH` or `echo -e ${PATH//:/\\n}` for a slightly prettier version) is not just a python thing, but it is very important to the functioning of python. If you open up a command line and type in a 'command', the computer (or 'operating system') needs to know where to look for that command to find the underlying code for it and then 'execute' it. These 'command files' are commonly known as executables and they are what gets run when you type in a word that matches their file name.

Let’s take the example of `echo`. When we type in `echo $PATH`, our computer needs to know where to find the code for the command `echo` and execute it by passing in an argument - `$PATH`. We can see where that code is with the following:

```
> whereis echo/bin/echo
```

where `whereis` is another executable that our computer knows how to locate:

```
> whereis whereis/usr/bin/whereis
```

Interesting. They sit in two different locations. What if we had the same executable name sitting in both of these places? Which one would we execute?

#### System Path Ordering

The `$PATH` variable is what dictates this and fortunately the operating system does the simple thing and works through it left-to-right / top-to-bottom. As an example, let's look at the following output for my system `$PATH` variable:

```
> echo -e ${PATH//:/\\n}/usr/local/bin/usr/bin/bin/usr/sbin/sbin
```

Say we go looking for an executable called `myspecialexec`. Our system will start at the top. In this case it will look in the directory `/usr/local/bin` and look for an executable file called `myspecialexec`. If it finds it, it executes it. If it doesn't, it then moves on to the next directory specified in the path - in this case `/usr/bin` before moving on to `/bin` if it doesn't find it there and so on.

#### What does this have to do with Python?

Python is an executable. That’s what you’re downloading (along with the standard library and a few other things) when you run `brew install python` or head on over to [here](https://www.python.org/downloads/) and run the python installer. You're doing one of the following things:

*   fetching the python executable and sticking it in one of the above directories in the `$PATH`
*   fetching the python executable and sticking it somewhere else, but then ensuring that _that_ directory name is now in the `$PATH`

So when you run the command `python`, your operating system starts flicking down the `$PATH` list and looking for the first match it can find for that name. If you have multiple versions, then it will take the version that it finds first. **If you have a version that you _want_ it to find, then you should put the location of that python version at the top of the path.** That last bit is key for understanding (and simplifying) what it is that all these tools do that 'manage environments' and 'manage python versioning'. Other things like package management are very simple once we understand how our computer decides which version of python to use.

#### Example 1: How does conda manage this so we use the correct version of python based on a conda environment?

[Conda](https://docs.conda.io/en/latest/) is, as it describes itself, _“an open source package management system and environment management system that runs on Windows, macOS and Linux”_. It was the first system I learned to try and create and manage a stable python environment and it gained popularity through its original attachment to the rise of machine learning and statistical programming in python (matplotlib, numpy, scipy, pandas, sklearn etc).

The ‘lighter’ version of it, [miniconda](https://docs.conda.io/en/latest/miniconda.html), is what most people talk about when they talk about ‘conda’. If you were to head on over to [here](https://docs.conda.io/en/latest/miniconda.html#installing) and install it you would now, just as with python:

*   have a `conda` executable file on your computer somewhere
*   that executable would be visible to your shell/terminal through being located somewhere that is in the `$PATH` variable

That means that when you type in `conda` in the terminal it would know how to execute the functionality that comes along with conda.

#### So how does conda ensure you use the desired version of python?

**By manipulating the $PATH variable, and in particular making use of the top-to-bottom nature of it**. To set up an example, let’s do the following. Assuming conda is installed and you open a new terminal/shell you will see:

```
(base) >
```

i.e. you are being directed to the default base conda environment that has been automatically created for you. The aim here is not to talk about environment creation, but it suffices to say that conda has gone and created a ‘base’ directory somewhere. And in that directory it has put:

*   the version of python that environment is attached to (so that every time you type `python` when in the base environment it runs the same version of python)
*   all other package dependencies that you may download for that environment

Where exactly is this directory? We can see that by using the command `which python`:

```
(base) > which python/Users/jamisonm/opt/miniconda3/bin/python
```

Okay great. So conda has created a directory somewhere and put a version of python in there that we can call. But how does our computer know to call _this_ version of python when we are in _this_ environment? Because it has put that directory at the top of the $PATH. We can verify this:

```
(base) > echo -e ${PATH//:/\\n}/Users/jamisonm/opt/miniconda3/bin/usr/local/bin/usr/bin/bin/usr/sbin/sbin
```

Now what happens when I deactivate the environment i.e. I don’t want to use this environment anymore and the corresponding version of python?

```
(base) > conda deactivate> echo -e ${PATH//:/\\n} # environment disabled so lose the (base)/usr/local/bin/usr/bin/bin/usr/sbin/sbin> which python/usr/bin/python
```

So `conda deactivate` has removed `/Users/jamisonm/opt/miniconda3/bin` from the top of the system path and so we default to the previous top-to-bottom search and end up with the pre-installed python in `/usr/bin/python`.

What about creating a new environment? Let’s create a new environment called `conda-demo`.

```
> conda create --name conda-demo> conda activate conda-demo(conda-demo) > echo -e ${PATH//:/\\n}/Users/jamisonm/opt/miniconda3/envs/conda-demo/bin/usr/local/bin/usr/bin/bin/usr/sbin/sbin
```

So once again conda has done the following:

*   created a folder somewhere (`/Users/jamisonm/opt/miniconda3/envs/conda-demo/bin`) to stick the version of python attached to this environment in (along with potential other downloaded packages)
*   stuck that directory at the top of $PATH so that when we type `python` it executes the python that exists in that directory and not one further down the `$PATH` variable

#### Example2: How does pyenv manage this so we use the correct version of python based on a specified environment?

Unlike conda, [pyenv](https://github.com/pyenv/pyenv) is not (originally) a fully fledged environment manager but is more meant to tackle the problem below:

_“How can I work on multiple projects on the same computer that use different versions of python and ensure that when I type_ `_python_` _I use the version of python I intended to use?"_

It’s a ‘Python Version Management’ tool that crucially does not involve any python. In order to install and manage different python versions, it is important that it itself does not depend on python and instead is mostly a load of bash scripts.

As you have probably guessed, it does this python version management through manipulating the `$PATH` variable. Things are a little more complex than conda, so let's go through an example. Assuming you have it [installed](https://github.com/pyenv/pyenv#installation) through something like `brew install pyenv`, when you start a new terminal/shell you should be good to go (because the statement (or something similar) `eval "$(pyenv init --path)"` will have been added to the end of your `.zshrc`/`.zprofile`/`.bash_profile`/`.bashrc`) and pyenv commands will be loaded up into your shell.

#### Set up the example

Before diving in let’s use pyenv to set up an example so we can demonstrate exactly how it works. Once pyenv is installed lets:

**Install 2 different versions of python and set 3.9.7 to be the global version**

In a fresh terminal type in the following to install both python 3.8.12 and python 3.9.7 and set python 3.9.7 as the preferred ‘global’ version of python to use:

```
> pyenv install 3.8.12> pyenv install 3.9.7> pyenv global 3.9.7
```

We can then check this was successful by checking the following:

```
> pyenv versions   system   3.8.12 * 3.9.7 (set by /Users/jamisonm/.pyenv/version)
```

**Make a ‘new project’ and set the local version of python to be 3.8.12**

In order to appreciate how pyenv can simultaneously manage multiple python versions we need to create a ‘new project’ and tell it that we don’t want to use the ‘global’ python version we have set — 3.9.7. To do this you can create any new directory and run the following:

```
> mkdir ~/pyenv-demo    # make a new directory called pyenv-demo in my home directory> cd ~/pyenv-demo       # cd into it> pyenv local 3.8.12    # set 3.8.12 as the python version to be used in this directory
```

What has this done? This has created a `.python-version` file that contains only the following text: `3.8.12`. If all goes to plan then:

*   when we are inside this directory (which is now a simple type of ‘environment’) we will use python 3.8.12
*   when we are outside it we will use the default 3.9.7

Now we have this in place we can examine how pyenv ensures we use the desired python version.

#### How does pyenv know to run that ‘local’ version of python when I type `python`?

First, let’s manoeuvre ourselves to our new directory by using `cd ~/pyenv-demo`. Let's see where we point to when we type `python` and if that makes sense based on our path:

```
> which python/Users/jamisonm/.pyenv/shims/python> echo -e ${PATH//:/\\n}/Users/jamisonm/.pyenv/shims/usr/local/bin/usr/bin/bin/usr/sbin/sbin
```

So we seem to be using a python executable in `/Users/jamisonm/.pyenv/shims` and just as with the conda case this is because pyenv has placed a directory at the top of our path (and so this is searched first) called `/Users/jamisonm/.pyenv/shims`. If we inspect the python executable specified we realise that it is not in fact a real python executable but a bash script called 'python'. This is what is meant by a 'shim' - we have tricked our operating system into running _this_ executable (which is _called_ python but isn't _actually_ python), rather than searching further through the `$PATH` and finding a true python executable.

#### So what does this ‘shim’ python script do?

Let’s have a look at it:

```
> less /Users/jamisonm/.pyenv/shims/python#!/usr/bin/env bashset -e[ -n "$PYENV_DEBUG" ] && set -xprogram="${0##*/}"export PYENV_ROOT="/Users/jamisonm/.pyenv"exec "/usr/local/opt/pyenv/bin/pyenv" exec "$program" "$@"
```

In a nutshell, it checks some debug criteria, sets a variable `PYENV_ROOT` and then calls _another_ executable: `/usr/local/opt/pyenv/bin/pyenv`. So, so far instead of calling python all it has done is intercept the call to python (through manipulating the `$PATH`) and then call itself.

We _could_ inspect this executable (`/usr/local/opt/pyenv/bin/pyenv`) but it is around 150 lines of bash script. Instead, assuming all goes well, we can focus on the bottom bit which has:

```
command="$1"case "$command" in"" )  { pyenv---version    pyenv-help  } | abort  ;;-v | --version )  exec pyenv---version  ;;-h | --help )  exec pyenv-help  ;;* )  command_path="$(command -v "pyenv-$command" || true)"  if [ -z "$command_path" ]; then    if [ "$command" == "shell" ]; then      abort "shell integration not enabled. Run \`pyenv init' for instructions."    else      abort "no such command \`$command'"    fi  fi  shift 1  if [ "$1" = --help ]; then    if [[ "$command" == "sh-"* ]]; then      echo "pyenv help \"$command\""    else      exec pyenv-help "$command"    fi  else    exec "$command_path" "$@"  fi  ;;esac
```

You can inspect the script yourself or you can take my word for it that this then points you to:

*   `command_path` = `/usr/local/Cellar/pyenv/2.2.0/libexec/pyenv-exec` (this is because I installed pyenv with brew which sticks this executable in the 'Cellar' directory)
*   `"$@"` = `python`

which means that now we have been shepherded on to yet _another_ executable i.e. `/usr/local/Cellar/pyenv/2.2.0/libexec/pyenv-exec` with an argument of `python`.

#### So what happens next?

Now this script is a bit shorter so we can print it all out and then in words walk through it:

```
set -e[ -n "$PYENV_DEBUG" ] && set -x# Provide pyenv completionsif [ "$1" = "--complete" ]; then  exec pyenv-shims --shortfiPYENV_VERSION="$(pyenv-version-name)"PYENV_COMMAND="$1"if [ -z "$PYENV_COMMAND" ]; then  pyenv-help --usage exec >&2  exit 1fiexport PYENV_VERSIONPYENV_COMMAND_PATH="$(pyenv-which "$PYENV_COMMAND")"PYENV_BIN_PATH="${PYENV_COMMAND_PATH%/*}"OLDIFS="$IFS"IFS=$'\n' scripts=(`pyenv-hooks exec`)IFS="$OLDIFS"for script in "${scripts[@]}"; do  source "$script"doneshift 1if [ "${PYENV_BIN_PATH#${PYENV_ROOT}}" != "${PYENV_BIN_PATH}" ]; then  # Only add to $PATH for non-system version.  export PATH="${PYENV_BIN_PATH}:${PATH}"fiexec "$PYENV_COMMAND_PATH" "$@"
```

The important bit is the bit that I have highlighted. This bit goes and checks for a `.python-version` file in the current directory and if it exists then it uses that. Otherwise it traverses all the way up the path to that directory looking for other `.python-version` files until it finds one. Otherwise it just defaults to using what we set as the global python version. In this case it:

*   finds the `.python-version` file in our pyenv-demo directory
*   reads it for `3.8.12`
*   goes to `/Users/jamisonm/.pyenv/versions` which is where the pyenv python executables are _actually_ stored
*   locates the one we want and sets our executable to `/Users/jamisonm/.pyenv/versions/3.8.12/bin/python`

The above process is described on [their git](https://github.com/pyenv/pyenv#choosing-the-python-version).

#### That seems quite complicated for what it is achieving

It is quite complicated — especially coming from programming python and trying to read through a bunch of bash scripts. However, ultimately all of this is hidden under the surface of a simple call to `pyenv`. Sometimes it's nice to understand _exactly_ what is going on but day-to-day it's not necessary to know this. The point remains however - it can seem complicated sometimes understanding the different environment management programs and python versioning, but it all comes down to just one thing: manipulating the `$PATH` variable in a consistent way so that the version of python you want is the version of python you get.

#### Conclusion

Hopefully from going through this things are starting to become simpler. ‘Environment management’ and ‘python versioning’ really just boil down to the following:

*   Environment Management: create a directory somewhere and stick the version of python we want to use with that environment in there
*   Python Versioning: Ensure that when we are in certain directories/environments, the path to the attached python executable is found first when going through `$PATH`
*   Package Management: Download required packages into the ‘same location’ as our desired python executable so they are used instead of packages meant for other environments

That last point we haven’t really gone through but once we understand how our computer knows which version of python to use when we type `python`, it's really not much more complicated at all. However to understand it, we need to understand the **module search path and** as we will see in the next article, that really isn't much more than making a few small standard manipulations to `$PATH` that are done when python starts up.

[**Python and the Module Search Path**  
markjamison03.medium.com](https://markjamison03.medium.com/python-and-the-module-search-path-e71ae7a7e65f "https://markjamison03.medium.com/python-and-the-module-search-path-e71ae7a7e65f")[](https://markjamison03.medium.com/python-and-the-module-search-path-e71ae7a7e65f)
