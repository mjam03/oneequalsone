---
title: "Random Sampling with SciPy and NumPy Part II"
pubDate: 2022-04-14
description: "Fancy algorithms, source code walkthrough and potential improvements"
---

![](https://cdn-images-1.medium.com/max/800/1*GuGjm6woROpyx68MUo2l0Q.jpeg)

Photo by [Андрей Сизов](https://unsplash.com/@alpridephoto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/algorithm?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

[In Part I](https://towardsdatascience.com/random-sampling-using-scipy-and-numpy-part-i-f3ce8c78812e) we went through the basics of Inverse Transform Sampling (ITS) and created our own ITS pure python implementation to sample numbers from a standard normal distribution. We then compared the speed of our somewhat optimised function to that of the built in SciPy function and found ourselves somewhat lacking — to the tune of being `40x` slower.

In this part the aim is to explain why that is the case by digging through the relevant bits of the SciPy and NumPy code base to see where those speed improvements manifest themselves. In general we will find that it’s made up of a combination of:

*   faster functions either due to being written in Cython or straight C
*   faster newer sampling algorithms compared to our tried and tested Inverse Transform Sampling

#### How do we generate normally distributed random samples in SciPy?

The following is the code to generate `1,000,000` random numbers from a standard normal distribution.

```
43.5 ms ± 1.2 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)
```

So the function `rvs` generates `1,000,000` samples in just over `40ms`. For comparison we were able to achieve this on average in `2.3s` using our algorithm which was based on the principle of inverse transform sampling. To understand the speed differences we're going to have to dive into that `rvs` method.

It’s worth noting that _(in general)_ with SciPy the core of the logic is contained in underscore methods — so when we want to have a look into `rvs` really we want to see the code for `_rvs`. The non-underscore methods generally implement some argument type checking or defaulting before handing over to the underscore methods.

Before working our way through let’s just do a brief overview of the way SciPy organises distribution functionality in the library.

#### rv\_generic and rv\_continuous

SciPy distributions are created from a neat inheritance structure with:

*   `rv_generic` as the top level class providing methods like `get_support` and `mean`
*   `rv_continuous` and `rv_discrete` inheriting from it with more specific methods

So in the above case where we initiated our normal distribution class `snorm` as `stats.norm()` what that is really doing is creating an instance of `rv_continuous` which inherits a lot of functionality from `rv_generic`. To be even more specific, we actually create an `rv_frozen` instance which is a version of `rv_continuous` but with the params of the distribution fixed (e.g. the mean and variance). With that in mind, let's now peer inside the `rvs` method.

#### rvs

When we run the `??` magic on `snorm.dist._rvs` we see the following code snippet:

```
# ?? snorm.dist._rvsdef _rvs(self, size=None, random_state=None):    return random_state.standard_normal(size)
```

So it seems like somewhere in the distribution class we created we have assigned a `random_state` object somewhere and that `random_state` object contains a method that can return numbers distributed according to a standard normal distribution.

**It turns out that the** `**random_state**` **object that spits out these random numbers is actually from NumPy.** We see this by looking at the source code for [rv\_generic](https://github.com/scipy/scipy/blob/b5d8bab88af61d61de09641243848df63380a67f/scipy/stats/_distn_infrastructure.py#L627) which contains in its `__init__` method a call to a SciPy util method called [check\_random\_state](https://github.com/scipy/scipy/blob/e3cd846ef353b10cc66972a5c7718e80948362ac/scipy/_lib/_util.py#L209) which, if no seed is passed already, will set the `random_state` as an instance of `np.random.RandomState`. Below is this code snippet:

#### Over to NumPy

So it seems like the ‘magic’ that delivers such blazing fast sampling actually sits in NumPy, not SciPy. This shouldn’t be all that shocking as SciPy is deliberately built on top of NumPy to prevent duplication and inconsistencies where the two libraries may provide identical features. This is explicitly stated in the first line of the SciPy Intro documentation [here](https://docs.scipy.org/doc/scipy/tutorial/general.html):

_“SciPy is a collection of mathematical algorithms and convenience functions built on the NumPy extension of Python.”_

To see what is going on we can have a look at the `np.random.RandomState` class [here](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/mtrand.pyx#L120). We can see from the use of:

*   `cdef` instead of `def` for function declaration
*   a `.pyx` file extension instead of .py

which both indicate that the function is written using [Cython](https://cython.readthedocs.io/en/latest/index.html) — a language very similar to Python that allows functions to be written in almost python syntax, but then compiled into optimised C/C++ code for efficiency. As they put it themselves [in the documentation](https://cython.readthedocs.io/en/latest/src/quickstart/overview.html):

_“The source code gets translated into optimised C/C++ code and compiled as Python extension modules. This allows for both very fast program execution and tight integration with external C libraries, while keeping up the high programmer productivity for which the Python language is well known.”_

Within this class there are two things we need to look at to understand the sampling process:

*   what it is doing to generate the uniformly distributed random numbers (the PRNG)
*   what algorithm it is using to convert these uniformly distributed numbers into normally distributed numbers

#### The PRNG

As mentioned in Part I, generating a random sample requires some form of randomness. Almost always this isn’t _true_ randomness, but a series of numbers generated by a ‘pseudo-random number generator’ (PRNG). Just as with sampling algorithms, there are a variety of PRNGs available and the specific implementation used here is [detailed in the](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/mtrand.pyx#L180) `[__init__](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/mtrand.pyx#L180)` [method](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/mtrand.pyx#L180) of `np.random.RandomState`:

As the above shows, when the class is initiated, the default PRNG is set to be an implementation of the [Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister) algorithm — named as such as it has a period length of a [Mersenne prime](https://en.wikipedia.org/wiki/Mersenne_prime) (the number of random numbers it can generate before it starts to repeat itself).

#### The Sampling Process

Some way down the code for the class `np.random.RandomState` we see [the definition of](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/mtrand.pyx#L1344) `[standard_normal](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/mtrand.pyx#L1344)` making a call to something called `legacy_gauss`. The C code for the `legacy_gauss` function is [here](https://github.com/numpy/numpy/blob/b991d0992a56272531e18613cc26b0ba085459ef/numpy/random/src/legacy/legacy-distributions.c#L18) and for ease of viewing we'll show it here:

As can be seen on Wiki in the [implementation section](https://en.wikipedia.org/wiki/Marsaglia_polar_method#Implementation), this is none other than a C implementation of the [Marsaglia Polar Method](https://en.wikipedia.org/wiki/Marsaglia_polar_method#Implementation) for generating random samples from a normal distribution given a stream of uniformly distributed input numbers.

#### Recap

We’ve gone through a lot there so it’s worth stepping back through and making sure everything is crystal clear. We’ve gone from:

*   a SciPy function called `_rvs`, written in python, initiates
*   a NumPy class `np.random.RandomState`, written in Cython, which
*   generates uniformly distributed numbers using the Mersenne Twister algorithm and then
*   feeds these numbers into a function `legacy_gauss`, written in C, which churns out normally distributed samples using the Marsaglia Polar method

The above highlights the lengths that the clever people building SciPy and NumPy have gone to to generate efficient code. We have a top layer callable by users (like you and me) that is written in python (for the ‘programmer productivity’ of python) before deeper layers of the infrastructure are increasingly written as close to C as possible (for speed).

#### Why is SciPy calling a NumPy function deemed ‘legacy’?

Because sampling is a branch of maths / computer science that is still moving forward. Unlike other areas where certain principles were agreed upon centuries ago and haven’t seen change since, efficiently sampling various distributions is still seeing fresh developments. As new developments get tested, we would like to update our default processes to incorporate these advancements.

This is exactly what happened in July 2019 with NumPy 1.17.0 when [they introduced 2 new features that impact sampling](https://numpy.org/devdocs/release/1.17.0-notes.html):

*   the implementation of a new default pseudo-random number generator (PRNG): [Melissa O’Neil’s PCG family of algorithms](https://www.pcg-random.org/index.html)
*   the implementation of a new sampling process: the [Ziggurat algorithm](https://en.wikipedia.org/wiki/Ziggurat_algorithm)

Due to the desire for backward compatibility of PRNGs however, instead of creating a breaking change they introduced a new way to initiate PRNGs and switched the old way over to reference the ‘legacy’ code.

The backward compatibility referenced here is the desire for a PRNG function to generate the same string of random numbers given the same seed. Two different algorithms will not produce the same random numbers even if they are given the same seed. This reproducibility is important especially for testing.

It appears SciPy hasn’t been upgraded yet to make use of these new developments.

#### Can we beat SciPy?

Given we know what we know now about how normal distribution sampling is implemented in SciPy, can we beat it?

The answer is yes — by making use of the latest developments in sampling implemented for us in NumPy. Below is an implementation of sampling where we:

*   use the latest PRNG
*   use the new ziggurat algorithm for converting these numbers into a normally distributed sample

```
# test scipy speed%timeit snorm.rvs(size=n)
```

```
51 ms ± 5.08 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)
```

```
# test numpy speed%timeit nnorm.normal(size=n)
```

```
24.3 ms ± 1.84 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)
```

So it seems like we’re around `2x` as fast as SciPy now - something that is in the expected 2-10x bracket as NumPy highlights in their release [here](https://numpy.org/doc/stable/reference/random/index.html#what-s-new-or-different).

#### Conclusion: how useful is this?

When it comes to implementing custom distribution sampling: very useful. We now fully understand the decision to pursue SciPy-esque sampling speed and can implement custom distribution sampling appropriately. We can either:

*   stick with the pure python inverse sampling transform implementation in Part I (after all, `2s` isn't bad for a sample of `1,000,000` in most contexts)
*   write our own sampling procedure — and preferably write this sampling procedure in C or Cython — which is no small ask

In the next part we’ll look at doing just that — implement an efficient custom distribution sampling function within the SciPy infrastructure. This gives us the best of both worlds — the flexibility to implement the exact distribution of our choice along with making use of the efficient and well written methods that we inherit from the `rv_generic` and `rv_continuous` SciPy classes.
