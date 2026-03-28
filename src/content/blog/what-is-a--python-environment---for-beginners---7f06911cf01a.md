---
title: "What is a ‘python environment’ (for beginners)?"
pubDate: 2021-11-05
description: "Clearly separating out the key concepts to demystify the environment creation process"
---

#### [Getting Started](https://towardsdatascience.com/tagged/getting-started)

![](https://cdn-images-1.medium.com/max/800/0*q2ATBBe-pHt7cUNv)

Photo by [Artturi Jalli](https://unsplash.com/@artturijalli?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

Coming from no computer science background and learning to program ‘on-the-job’, the whole process of getting a stable python environment up and running was daunting. There were/are the appearance of loads of steps, new terminology (`sys.path`, 'virtual environment'/'venv', the outdated `$PYTHONPATH` etc.) as well as lots of tools (pip, pyenv, venv, conda, poetry) that are supposed to make things easier but maybe in the process:

*   hide the more simplistic workings of getting set up (especially to a beginner) such that you never actually understand what’s going on
*   have varying scope such that some tools do one thing (dependency management or virtual env setup), others do several (like conda and poetry) and so it’s hard to know what should be used for what

This a collection of my notes from a deep dive into python environments in 2021 in a bid to:

*   understand it myself
*   reduce the amount of times I click on purple Stack Overflow links because 4 years ago the info went “in one ear and out the other”
*   consider changing from what I learned before (conda+setuptools) and never questioned just because “if it ain’t broke don’t fix it”

#### What are the components of a stable functioning environment?

In a way — what’s the aim? Most people would tend to agree that when writing python code that you wish to reuse or share, forgetting about the actual code itself, you want the following things:

*   easy to work on and know if it worked before it will keep working (environment management)
*   easy to work on alongside something else that might use a different version of python and other packages (python version & dependency management)
*   easy to share with other people (package building and distribution)
*   when other people get it, they can run it with no problems (environment management)
*   they can run it if they are also depending on someone else’s code (dependency management)
*   if the above things ever become problematic, it is either easily resolved or how to resolve it is made clear (environment management)

In creating a python setup that takes these things into account, the problem can be split into several sub-problems.

**Environment Management (venv, conda, poetry)**

This concerns being able to set up a container in your computer that ensures that everything that is required to run your code stays the same. This usually takes the shape of a directory structure with the stuff you need in it, but also might do things like set stable directions to the stuff you need that is outside that directory. Keeping things stable is great because it ensures unchanged code written one day works the next. If the environment is created formulaically as well, then it can be described formulaically. This is great because the environment you are using to run your code can then be formulaically expressed so that if someone else wants to run that code they just need to follow that exact recipe to have an exact matching environment and ensure it doesn’t ‘randomly’ not work for them.

**Python Versioning (pyenv)**

Python is a language and like all languages it develops. To avoid complete chaos of a continuously changing language, changes/updates are discretised with each new release given a version number to identify it. As per above, to ensure unchanged code keeps working then you need to ensure you keep using the same version of python — or at least until you have tested that the same code will work with a different (hopefully newer) version of python. This might pose a problem if you have multiple projects that each use different versions of python (either through choice or because you have to because of dependencies — more on this later) and so ideally we could have something to be able to run different versions of python when we work on different projects. This is Python Version Management.

**Package Installation (pip, conda, poetry)**

Probably not all the code you write will be all yours and as such you’ll want to make use of some of the code that has already been written. Python comes pre-packed with a load of stuff that make up the [Python Standard Library](https://docs.python.org/3/library/) but there are loads of other packages out there that you’d rather make use of than try to write yourself (NumPy, pandas, SciPy etc). We need a way to get these onto our computer — or more specifically into our environment that we’ve created _within_ our computer. Fortunately as [this video](https://www.youtube.com/watch?v=AQsZsgJ30AE) explains there are people who have worked to standardise this and create a database of all these packages called [PyPI](https://pypi.org/). Once the code is consistently logged there we then need a way to go there and grab it and install it into our nicely controlled environment. We’d also like a way to ensure that if we have multiple projects like described above that are using various versions of python, then we can install the correct corresponding version of potentially the same package into their respective environments. This is Package Installation.

**Dependency Management (conda, poetry)**

The above package installation sounds simple enough:

*   give it a list of demands
*   it goes to a database on the internet and collects them
*   it installs them using standardised instructions that they all conform to

but just as with the python language itself, these other packages are constantly changing. In fact, _because_ python is constantly updating these other ‘3rd party packages’ are updating — because they need to be tested and updated to use newer versions of the underlying python standard library. And potentially make use of new features to extend or improve existing functionality. With a load of packages updating on random days and with different demands of what they depend on, it is not very hard to end up with 2 packages that depend on conflicting versions of another shared dependency. Resolving these conflicts such that all the dependencies that we need, given the constraints we may have specified, can be grabbed and installed is Dependency Management.

**Package Building and Distribution (setuptools, poetry)**

So far we have only talked about how to build a stable environment under the assumption that we need to grab code written by other people. But what if one day the code that we write, enabled by this stable environment, could be of use to someone else and we’d like to share it? Do we ping it over to them in an email? Preferably we submit it to the aforementioned database of python code PyPI so that, just with everything that we have depended on, others can depend on our code in a way that is easy to install and understand exactly:

*   how to install what we have written (standardised format of code through ‘.whl’ files)
*   what code your code can play ball with (the set of dependency restrictions our code has — if any)

To do this we need a way to build our code into a ‘package’ with all the corresponding meta data that that requires. Standardisation is key here and ensuring this standardisation in a relatively pain free way is Package Building.

#### This seems like a lot to just write a few lines of python

The many steps above may give the impression that this is an incredibly difficult task just to write a bit of python. Obviously writing a bit of python locally tends to be as easy as opening a command line and typing `python` (Macs come pre-installed with it). But to write something a bit more substantial this seems like a load of effort and complication, especially for someone who is just starting and has no idea what many of the 'most basic' words mean. To complicate things the above mentioned tools kind of obscure away what is actually going on and can even make it more confusing to understand the fundamental question at hand:

_“How can we control exactly what happens when you type the word_ `_python_` _into your command line such that we have access to everything we need (modules, packages) and this access remains 'deterministic’?"_

Solving that means that working code will always stay working and ultimately save time down the line trying to debug tricky versioning issues. And to understand how some very smart people have developed tools to help us do this, we can look at just the following two things:

*   the system path (`$PATH`)
*   python’s `sys.path` variable and the 'module search path'

Let’s look at how the system `$PATH` variable works in the next article and take a deep dive into how popular python tools (pyenv, conda, poetry) manipulate this to make our life easy when it comes to python version management.

[**Python, The System Path and how conda and pyenv manipulate it**  
_A deep dive into what happens when you type ‘python’ in a shell and how popular environment management tools manipulate…_markjamison03.medium.com](https://markjamison03.medium.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e "https://markjamison03.medium.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e")[](https://markjamison03.medium.com/python-the-system-path-and-how-conda-and-pyenv-manipulate-it-234f8e8bbc3e)
