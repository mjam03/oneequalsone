---
title: "Python and the Module Search Path"
pubDate: 2021-11-05
description: "How python knows which packages to import, where to find them and how modern tools (conda, pyenv, poetry) make this easy for us"
---

![](https://cdn-images-1.medium.com/max/800/1*1X0-98EiQNkwBJj2vnTTqQ.jpeg)

Photo by [Chris Ried](https://unsplash.com/@cdr6934?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/code-system-path?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Previously we’ve looked at ([article here](https://markjamison03.medium.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e)) how various tools (conda, pyenv) manipulate the `$PATH` variable so that when you type `python`, the version of python you want (in a given environment) is the version of python you get. That's all great for importing the python standard library of default functions, but what about:

*   when we want to install 3rd party packages from PyPI (like numpy, pandas, scipy)
*   when we want to locally install our own packages/modules — either dev stuff or testing before building our own packages for PyPI

How does python know:

*   where to look for these packages
*   how to prioritise them if we have two with the same name

To do this, it constructs the ‘module search path’ the second you type in `python`.

#### What happens when you type `python`?

So we know already that when you type `python` your operating system looks top-to-bottom through the path for the first executable with the name 'python' (whether or not it is actually a python executable as the pyenv shims pointed out). Then, once it has located it, it executes it. But what does this do? What comes next? In the context of knowing how to locate our packages we care about how it constructs the `sys.path` variable.

Similar to `$PATH`, `[sys.path](https://docs.python.org/3/library/sys.html#sys.path)` is an internal python version and similar to how an operating system traverses top-to-bottom `$PATH` for matching executables, python traverses `sys.path` for matching packages and modules.

[**Python, The System Path and how conda and pyenv manipulate it**  
_A deep dive into what happens when you type ‘python’ in a shell and how popular environment management tools manipulate…_towardsdatascience.com](https://towardsdatascience.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e "https://towardsdatascience.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e")[](https://towardsdatascience.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e)

#### How is `sys.path` determined and set?

There is a great article [here](https://newbedev.com/where-is-python-s-sys-path-initialized-from) that goes through the intricacies of this and that even though it seems like a simple task there are many hoops to jump through. With ‘modern python setups’ where we are fortunate enough to use one or a combo of:

*   pyenv
*   conda
*   poetry

this process is largely simplified as we don’t _really_ care too much about things like `$PYTHONPATH` and `$PYTHONHOME` as they tend to be blank.

Let’s go through an example. I am using `pyenv` and just as per before we can verify which version of python we are running:

```
> pyenv version3.9.7 (set by /Users/jamisonm/.pyenv/version)
```

Given that we have gone through [in a previous article here](https://markjamison03.medium.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e) how pyenv actually works to find and set the executable based on this we know that we are using `/Users/jamisonm/.pyenv/versions/3.9.7/bin/python` as the python executable in this instance. So what happens now?

**Find the location of this version of python being executed**

So the operating system executes the python executable and then the executed program asks the operating system for its location. Assuming no hiccups this is then set in the variable `sys.executable`\=`/Users/jamisonm/.pyenv/versions/3.9.7/bin/python`.

**Set sys.prefix and sys.exec\_prefix**

Next, python sets the prefix and exec\_prefix which appear to generally be the same. If our `sys.executable` variable is set to `/Users/jamisonm/.pyenv/versions/3.9.7/bin/python` then `sys.prefix`\=`sys.exec_prefix`\=`/Users/jamisonm/.pyenv/versions/3.9.7/`. However, if a `pyvenv.cfg` file exists in the directory above `sys.executable` then it is read and both `sys.prefix` and `sys.exec_prefix` are set to that directory - this is controlled by [this function here](https://github.com/python/cpython/blob/32f55d1a5de66f9a86964fc0655d7a006a9d90b9/Lib/site.py#L495).

**Set sys.path using sys.prefix and sys.exec\_prefix**

Python now imports the module [site](https://docs.python.org/3/library/site.html#module-site) and runs its [main function](https://github.com/python/cpython/blob/32f55d1a5de66f9a86964fc0655d7a006a9d90b9/Lib/site.py#L587). According to the docs [here](https://docs.python.org/3/library/site.html#module-site), this does the following:

_“It starts by constructing up to four directories from a head and a tail part. For the head part, it uses sys.prefix and sys.exec\_prefix; empty heads are skipped. For the tail part, it uses the empty string and then lib/site-packages (on Windows) or lib/pythonX.Y/site-packages (on Unix and macOS). For each of the distinct head-tail combinations, it sees if it refers to an existing directory, and if so, adds it to sys.path and also inspects the newly added path for configuration files.”_

In practise this adds the following to sys path:

```
/Users/jamisonm/.pyenv/versions/3.9.7/lib/python39.zip/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/lib-dynload/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/site-packages
```

And that’s it. Now we have our `sys.path` variable. Just like with `$PATH` and the operating system, python walks down the `sys.path` variable top-to-bottom looking for matching module and package names and when it finds one it executes that bit of python code. The only difference with `$PATH` is that python first inspects the local calling directory for matching modules before walking through `sys.path` (more on this below).

![Drawing](https://cdn-images-1.medium.com/max/800/0*Tt0oeVC1bCnU9fY6.png)

Image from [https://xkcd.com/1987/](https://xkcd.com/1987/)

#### What’s ‘site-packages’?

That’s where all the 3rd party packages go that you download from PyPI (through pip, conda, poetry etc). Once we see things in this way, the idea of managing an environment and ensuring all the dependencies are in the right place becomes pretty trivial. Once we have the correct location of the python executable, we just make sure we follow the rules and place it in the corresponding `site-packages` folder. When we type `python` in that environment then:

*   the operating system traverses the `$PATH` variable to find and execute the correct version of python
*   the operating system then hands down that location to the python executable as it initialises things like `sys.executable`
*   python also creates the `sys.path` variable based on the above formula, specifying to find packages in that corresponding `site-packages` folder

#### What about installing a package locally?

The above works great if we want to set up an environment with a specific version of python and the associated dependencies which we can grab from PyPI. But what about stuff that isn’t on PyPI? Or what about if we pulled a package from PyPI and modified it (potentially to improve it) and want to use that?

For this, python has another solution — **.pth files**. From the python docs [here](https://docs.python.org/3/library/site.html#module-site):

_“A path configuration file is a file whose name has the form name.pth and exists in one of the four directories mentioned above; its contents are additional items (one per line) to be added to sys.path. Non-existing items are never added to sys.path, and no check is made that the item refers to a directory rather than a file. No item is added to sys.path more than once. Blank lines and lines beginning with # are skipped. Lines starting with import (followed by space or tab) are executed.”_

So in order to write some code locally and ensure that when we start python somewhere we can import the code we need to:

*   write the code in a file called `module_name.py`
*   somewhere in one of the directories in `sys.path` (usually `site-packages`) add a file called `module_name.pth` that contains the directory that our module sits in

**This is exactly what happens when you run something like** `**poetry install**` **or** `**pip install . -e**` - a .pth file is added to the `site-packages` folder that adds that location to the `sys.path` variable.

Let’s put this to the test with a test module. In a new directory create a folder called test. In my home directory we have `mkdir ~/test`. We can then add the following file to that directory called `datetime.py` (deliberately named to clash with the `datetime.py` file in the python standard library. All in, we have the following:

```
> mkdir ~/test> cd test> touch datetime.py
```

and then add the following to `datetime.py`:

```
def hello_world():    print('hello world')    return
```

Finally, we need to add our `test.pth` file to our current environment's `site-packages` directory. As per above, with pyenv (in my global setting using python version 3.9.7) my directory sits at `/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/site-packages`. We can then add the following to it:

```
> cd /Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/site-packages> echo "/Users/jamisonm/test" > test.pth
```

where the last command is a one liner to create a text file with the directory that we want. Now if we start python and run sys.path we see the following:

```
>>> import sys>>> print('\n'.join(sys.path))/Users/jamisonm/.pyenv/versions/3.9.7/lib/python39.zip/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/lib-dynload/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/site-packages/Users/jamisonm/test
```

where the bottom entry has been added. This is because when python scans the previous 4 locations in `sys.path` it has found a `.pth` file (the `test.pth` file we created) and accordingly added it to `sys.path` at the end. Importantly this means:

*   python will search the other locations first for a match to a package or module name before looking in `/Users/jamisonm/test`
*   before this, python actually searches the current directory for a match

This means that if we run the following from `/Users/jamisonm/test` we see:

```
import datetimedatetime.date.today()Traceback (most recent call last):  File "<stdin>", line 1, in <module>AttributeError: module 'datetime' has no attribute 'date'
```

because the `datetime.py` module we defined in `/Users/jamisonm/test` takes precedence over the rest of `sys.path` - including the python standard library module `datetime.py` defined in `/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9`. But if we move out of the `test` directory and repeat we see:

```
import datetimedatetime.date.today()datetime.date(2021, 11, 5)import sysprint('\n'.join(sys.path))/Users/jamisonm/.pyenv/versions/3.9.7/lib/python39.zip/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/lib-dynload/Users/jamisonm/.pyenv/versions/3.9.7/lib/python3.9/site-packages/Users/jamisonm/test
```

i.e. python finds the standard library `datetime.py` module first (which contains the `datetime.date.today()` function), even though `/Users/jamisonm/test` is still in our `sys.path`.

#### Conclusion

Similar to how your operating system determines which python version to run when you type in `python` by top-to-bottom traversing your `$PATH` variable, python creates and searches through the module search path (mostly by creating the `sys.path` variable) to locate installed packages and which should take precedence if we have a name collision.

Once we understand things this way, the subject of environment and dependency management becomes easier. Tools that make life easier for us by removing the manual work in setting these variables are immensely helpful, but the underlying process is not necessarily hugely complex:

*   operating system locates correct version of python to use
*   using that info, python defines `sys.path` to create the module search path
*   .pth files can be added into one of these locations to add the locations of local modules to the end of the [module search path](https://docs.python.org/3/tutorial/modules.html#the-module-search-path)

Tools like conda and pyenv+poetry do just that — they make it easy for us to keep on top of these steps by creating, altering and managing these python executables, corresponding site-packages directories and any .pth files added to them to ease local development.
