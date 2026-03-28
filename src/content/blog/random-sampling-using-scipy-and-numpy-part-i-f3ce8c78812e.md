---
title: "Random Sampling using SciPy and NumPy Part I"
pubDate: 2022-04-14
description: "Intro to sampling, writing our own, speed testing"
---

![](https://cdn-images-1.medium.com/max/800/1*PjYutcq8mNYiu84t7J8N7g.jpeg)

Photo by [Edge2Edge Media](https://unsplash.com/@edge2edgemedia?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/statistics?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Being able to draw a random sample from a distribution of your choice is very useful. It underlies any kind of stochastic process simulation whether that’s particle diffusion, stock price movements, or modelling any phenomena that displays some kind of randomness through time.

For that reason, having access to accurate and efficient sampling processes is very important. The importance only increases once we get to distributions that are used here, there, and everywhere like the normal distribution.

The following is a ‘deep dive’ into how SciPy and NumPy package this up for us to make large-scale sampling blazing fast and easy to use. Anyone with a bit of history using SciPy will tell you that the reason is the following:

*   it’s written by some very clever people
*   it’s very optimised code
*   it uses underlying numerical routines written in C

which is all true. The aim here is to go a bit further into exactly how this happens and why smart people can make things go faster with some clever algorithms.

#### Why should I care what happens ‘under the hood’?

Because SciPy can only get us so far, even though [the range of distributions it offers is quite incredible](https://docs.scipy.org/doc/scipy/reference/stats.html). The problem lies when we want to sample from ‘custom distributions’. What if instead of sampling from a given parameterised normal or exponential distribution we want to start sampling from our own distribution? Maybe because this distribution better represents the data we are trying to fit and we’d like to leverage a Monte Carlo process for some testing?

In these situations as we’ll see below it pays to understand how it works because:

*   writing your own naive sampling mechanism can be incredibly slow
*   understanding how it works can allow us to write our own custom distribution _within_ the SciPy framework

#### How does sampling work?

Rephrasing: given a density function (pdf), how can I use this to draw random samples which if I were to plot them they would form a histogram the same shape as the pdf? To add a bit of visuals to this statement let’s use the example of a normal distribution. Using SciPy let’s plot the pdf and then generate a load of random samples — before getting into the nitty gritty of:

*   how it is generating these samples
*   how it does it so fast

![png](https://cdn-images-1.medium.com/max/800/1*KSgUJJ3SbNyKNc3soNT7eA.png)

Image by author

So the blue line shows our plotted pdf and the orange histogram shows the histogram of the `1,000,000` samples that we drew from the same distribution. **This is sampling - given a specified blue line (whatever shape it may take), how can we define a process (preferably fast and accurate) that can generate numbers that form a histogram that agrees with the blue line.**

To answer the original question of _how_ we do this, the answer is: it depends. There are many ways to do this and each of these methods have advantages and disadvantages. As we’ll find out some of these methods are much faster than others. To begin with we’ll focus on one specific method that is general in its approach and that we’ll use as the baseline for comparing the speed of SciPy. We can’t call SciPy fast if we have nothing to compare it to.

#### Inverse Transform Sampling (ITS)

There are a few ideas here that we’ll try and condense down into several short paragraphs before writing some basic code to illustrate and form our speed benchmark. To start with we’ll address the following — **generating random numbers requires some kind of random number generator**.

Regardless of the distribution we want to get them from we need some sort of underlying random process. In the case of computers, this process can’t really be _truly_ random as it needs to be able to be programmed into a machine, but they can be ‘pseudo’ random.

In other words, if we don’t know the underlying process that is generating the numbers then they can appear random to us even if they are not random to the generating process. To borrow from Nassim Taleb, what’s random to the turkey on Christmas day isn’t random to the farmer — it all depends on your information set. Such a process is called a pseudo-random number generator (PRNG) and there are lots of competing ones on offer.

Let’s just take it for granted that we have such a PRNG that generates these random numbers and that these random numbers are from a uniform distribution. If you are curious about how exactly these numbers are created then I’ve written an explainer [here](https://towardsdatascience.com/where-does-python-get-its-random-numbers-from-81dece23b712), but for this article it will suffice to say that such a process exists.

[**Where does python get its random numbers from?**  
towardsdatascience.com](https://towardsdatascience.com/where-does-python-get-its-random-numbers-from-81dece23b712 "https://towardsdatascience.com/where-does-python-get-its-random-numbers-from-81dece23b712")[](https://towardsdatascience.com/where-does-python-get-its-random-numbers-from-81dece23b712)

Once we have those uniformly distributed numbers we then need a way to _transform_ them into the numbers that abide by the pdf that we specify (the blue line above). To do this we can make use of the [following theorem](https://en.wikipedia.org/wiki/Probability_integral_transform). It turns out that if we:

*   sample a load of numbers from a continuous probability distribution
*   get the value of the cdf for all of these samples

**…the distribution of those cdf values will be uniformly distributed.** To see this there’s a great gif [here](https://gfycat.com/unfitflatflounder) that shows this process for a standard normal distribution. But more useful to us is the reverse — or the _inverse_. If we start with a load of uniformly distributed random numbers (which our PRNG will give us), then we can fire them at the ‘inverse’ cdf and obtain a load of numbers that follow the distribution that we wanted. This is what inverse transform sampling is.

GIF from [https://gfycat.com/unfitflatflounder](https://gfycat.com/unfitflatflounder)

#### Can we code this up?

Absolutely. Writing this down and creating our own normal distribution random sampler will serve two purposes:

*   provide a code analogue to the above theoretical explanation
*   create a pure python comparison for the SciPy implementation to check speed

First let’s define our pdf. We won’t give SciPy too much of an advantage so to keep things reasonably fast we’ll:

*   leverage NumPy for vectorised calculations
*   encode `sqrt(2 * pi)` as a float to save on the multiply and sqrt operations

```
# define std normal pdfdef norm_p(x):    return np.exp(-0.5 * x**2) / 2.5066282746310002
```

Next we need to create the cdf so we can invert it. To do that we’ll:

*   define a range of values and compute the pdf at each of these values
*   normalise the pdf values so we have a density function i.e. the area under the pdf will be `1`
*   use the ‘cumulative’ in ‘cumulative distribution function’ to create the cdf: we simply apply a cumulative sum to these pdf values to create our cdf

The following code implements this and just for good measure we’ll graph both the created pdf and cdf for inspection.

![png](https://cdn-images-1.medium.com/max/800/1*hcxdwkZtlYiNdVje-IZFLQ.png)

Image by author

So it looks as expected. Now we need to take the generated cdf — which at this point is just a set of values of the cumulative probability for a set of x values and turn that into a function. In particular we would like to turn it into the inverse function. Fortunately for us we can rely on SciPy and use the interpolation function `interp1d`:

```
# generate the inverse cdffunc_ppf = interp1d(my_cdf, xs, fill_value='extrapolate')
```

We’ve called it a ‘ppf’ — percentage point function as this is consistent with the SciPy terminology but this is exactly what we wanted to achieve — an inverse cdf function. Now we have this function we can use it to:

*   first: fire uniformly distributed random numbers at it to generate samples from a standard normal distribution
*   second: compare how fast it does this compared to the built in SciPy sampling

#### Distribution check

First let’s double check to ensure we are generating numbers according to the correct distribution — in other words that I haven’t lumped a bug into the above few lines of code. As mentioned, now that we have our inverse cdf we just need to fire random uniformly distributed numbers at it. How do we obtain those uniformly distributed random numbers?

Let’s make use of the random number generator in NumPy:

![png](https://cdn-images-1.medium.com/max/800/1*EaaooGhrpE5IMu1hUX_0xg.png)

Image by author

So we can be confident that the function we created does indeed draw random samples from a standard normal distribution — our orange histogram lines up with the SciPy generated blue line representing the pdf.

#### Speed

Now on to the main question — how does the function we have generated compare to SciPy?

```
%timeit func_ppf(np.random.uniform(size=n))
```

```
2.32 s ± 264 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```
%timeit snorm.rvs(size=n)
```

```
56.3 ms ± 1.08 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)
```

So even though we’ve done our best to create an efficient implementation of a normal distribution sampler we’re still `41x` slower than SciPy doing the same thing. This begs the next question: why?

#### Recap

Before ploughing into the SciPy and NumPy code bases to figure out why we’re still being left for dead when it comes to speed, let’s just briefly recap what we’ve established:

*   sampling is the process of drawing random numbers that as a collection abide by a given pdf
*   there are many ways to implement this sampling — one such way is called Inverse Transform Sampling
*   ITS relies on inverting the cdf of a given distribution before plugging in uniformly distributed random numbers to it
*   even with a fairly efficient self-implementation of this we are around `40x` slower than SciPy

With that in mind, [let’s move on to Part II](https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-ii-234c2385828a) and start digging through the SciPy and NumPy code bases.

[**Random Sampling with SciPy and NumPy Part II**  
towardsdatascience.com](https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-ii-234c2385828a "https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-ii-234c2385828a")[](https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-ii-234c2385828a)
