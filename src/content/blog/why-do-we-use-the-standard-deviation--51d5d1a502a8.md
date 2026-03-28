---
title: "Why do we use the standard deviation?"
pubDate: 2022-02-09
description: "Fisher, parameterisation, efficiency and CLT"
---

![](https://cdn-images-1.medium.com/max/800/1*AseXoNeMN-IHiDqJicmupA.jpeg)

Photo by [Алекс Арцибашев](https://unsplash.com/@lxrcbsv?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/statistics?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

It feels like knowledge has advanced, and is continuing to advance, so quickly that in order to keep up there is no time at school to explain how and why things are the way they are. For me, standard deviation is one of those things: something that is simply stated as _thee_ way to measure dispersion with no explanation for why we do this convoluted process of squaring, averaging then square rooting. The aim here is to take a brief jolly through the history of theoretical statistics (thrilling!!!) and in the process understand both the historical and theoretical reasons why it is so prevalent; and perhaps why it shouldn’t be.

#### What is it?

Quick definition first. In words, given a set of data, if we:

*   compute every point’s deviation from the mean
*   square that deviation
*   sum them all up and divide by the count (to get the average squared deviation)
*   take the square root of that sum

we get the standard deviation (STD). More formally, if we have a random variable, `X`, and we form a sample by collecting `n` observations `{x_1, x_2, ...x_n}` (e.g. could be recordings of random people's heights) then we can compute the sample standard deviation as:

![e44614e7-58b9-4c0f-89fb-f09645810947.png](https://cdn-images-1.medium.com/max/800/1*WkitcJ61LZufxs4-efcKRw.png)

Image by author

In this definition we have assumed that we know the population mean (not using the sample mean as an estimate). If we didn’t we would replace the population mean with the sample mean and leverage [Bessel’s Correction](https://en.wikipedia.org/wiki/Bessel%27s_correction) (divide by `n-1` instead of `n` - if interested in this then I've written an intuitive explainer [here](https://towardsdatascience.com/why-is-the-sample-variance-distributed-with-n-1-degrees-of-freedom-c9edcdada28b)) but overall the idea remains the same. Take the average of the squared deviations from a central point and take the square root of them.

#### Why does it look like that?

I don’t think it’s _too_ big a stretch to say that when you actually look at it it seems a bit complicated. Sure, the mathematical operations are simple — but outside of the fact it’s been drilled into your brain since you were 11 it’s not actually that obvious why we would formulate it that way.

One explanation given is usually the following:

*   we square observations to make them all positive
*   taking the square root returns the quantity back to the original units of measurement

In other words we need all the values to be positive to prevent negative deviations cancelling out positive deviations (we want all the measured dispersion to accumulate) and then we want the final number to be comparable to the data we measured. In the example of going on the street and asking people how tall they are we want our measure of dispersion to be in ‘metres’, not in ‘metres squared’ so we square root that sum.

But that explanation isn’t really complete. There are lots of ways we can make values positive. We can take their absolute value or we could use a different (even) exponent — like 4. If we didn’t use a power (squaring) then we wouldn’t then need to take the square root at the end to return the quantity to the right units. To understand why it is the way it is we need to go back a bit in history.

#### Statistics vs Probability

At school I always found it hard to dissect the difference between probability and statistics. They came as a pair to my brain and despite many of my brain’s failings this doesn’t necessarily feel like one of them. Because in today’s world, they kind of _do_ come as a pair. But this wasn’t always the case.

Probability has been knocking around for a while but largely concerned with games of chance — coins, cards and dice. Given a fixed ‘data generating process’ (i.e. a coin flip or dice roll) probability concerned questions like predicting what the probability of `x` was in `n` trials? There was no data involved as such but more just pure maths - given a mathematical function (which we know) what is the probability of it creating a certain outcome?

Similarly statistics was around but not like we know it today. If we go back to pre-1900s statistics was concerned with ‘matters of the state’ through descriptive statistics of quantities of interest to the state — the word itself being derived from the latin word for ‘status’ or ‘government’. In a way, statistics used to be just descriptive statistics — given some data, can we come up with some measures to condense all that information down to a few numbers that represent it? There was no real developed concept of using data to make probabilistic statements. The answer to questions like:

_“How sure can we be that the average height we collected in our sample data is equal to the true average height across the population?”_

was simply ‘I dunno’. So what changed?

#### Fisher and Parameterisation

The advent of the 1900s brought the likes of [Galton](https://en.wikipedia.org/wiki/Francis_Galton) and [Pearson](https://en.wikipedia.org/wiki/Karl_Pearson) and the founding of [Biometrika](https://en.wikipedia.org/wiki/Biometrika) in 1901. It was Pearson who first introduced the term ‘standard deviation’ in his lecture notes and you can see [here](https://royalsocietypublishing.org/doi/10.1098/rsta.1894.0003) his use of it (interestingly he also coins the phrase ‘normal’ here to refer to the normal distribution rather than the previously used ‘law of errors’ that De Moivre and Gauss settled on).

However, it was [Ronald Fisher](https://en.wikipedia.org/wiki/Ronald_Fisher) who really kicked things on and is largely credited with establishing the modern ‘inferential’ statistics. It was him who pushed for the idea of likelihood (rather than inverse probability). If probability gives you a framework and asks you to calculate the chance of a certain set of data occurring from that framework, it is him who formulated statistics as a kind of inverse: given a set of observed data what is the most likely framework to generate that data?

How do we work out that ‘most likely framework’? We estimate it — specifically by choosing a distribution and then using the data to infer the most likely parameterisation of it given the data we have. As an example, given a set of data we want to know what the most likely estimate of the population mean is. It is Fisher’s influence that leads us to use the statistic of the sample mean. It is Fisher’s influence that let’s us make statements about:

*   what we can ‘expect’ that sample mean to be
*   what the distribution of that statistic should be

And through this newfound focus on what the best statistics are for estimating population parameters was borne Fisher’s argument for standard deviation.

#### Fisher vs Eddington (circa 1920)

The question at hand was the following. Given two ways of measuring dispersion — STD and MAD — what is the best one to use? Fisher used his newfound idea of the ‘efficiency’ of a statistic to answer. In simple words he argued that if there are 2 ways to do things then we should choose the one with the lowest variance. This means that on any given day when we sample and compute our statistic, that statistic is more likely to be closer to the quantity that we wish to know (the population parameter).

It’s an argument that’s hard to disagree with. And he then showed (with some assumptions) that the STD is more efficient than the MAD which Eddington favoured. In fact we can demonstrate what he showed by drawing some samples ourselves. We can:

*   generate 10,000 samples of 10,000 observations from a standard normal distribution (mean zero, var 1)
*   compute the sample STD and MAD per sample (10,000 of each)
*   plot their distributions
*   compute the ‘relative efficiency’ (RE)

where the RE is defined as the ratio of their ‘efficiency’ — which for a random variable `x` is defined as:

![b16afbef-df57-4acc-af9e-12eeeb49f196.png](https://cdn-images-1.medium.com/max/800/1*drLqv7uDT_pimIFRqZAkPQ.png)

Image by author

```
Relative Efficiency, STD/MAD: 87.20%
```

![png](https://cdn-images-1.medium.com/max/800/1*cxmiJ23vL_PQm1EewfwCzQ.png)

Image by author

So what does this show? The left chart shows the distribution of the sample STDs whilst the right the distribution of the sample MADs. We then compute the efficiency for each and can see at the top of each chart that the efficiency of the STD is slightly better than that of the MAD. When we look at their relative efficiency we see that STD is around 12.5% more efficient than MAD. **It is this result that Fisher proved analytically that swayed the argument in favour of STD.**

#### Are there any caveats?

Yes. As with many statistical results, the above result was derived:

*   asymptotically
*   assuming the sampled variable in question is normally distributed

Eddington was (rightly) dismayed at the result and the course it helped steer the following mathematical theory on as it was not what he saw borne out in his day to day life as a scientist. In a way it was the hand-wavy practical observations of a scientist vs the neat elegant mathematical proofs of a limit-theorem wielding mathematician and, as is so often the case, the neat maths won out (for another example see the direction of the macroeconomics literature post 1970 — nice paper on it by Paul Romer [here](https://paulromer.net/trouble-with-macroeconomics-update/WP-Trouble.pdf)). It turns out that in the presence of non-normality (and even the slightest amount) the result reverses. It also turns out that almost nothing in life is actually perfectly normal.

#### Prove it

Just as before let’s use some simulations to prove the point. In the above we generated samples and compared the efficiency using the RE. Let’s do it again but this time we will use a neat trick from Taleb’s work to create a ‘mixed distribution’ so that we end up with:

*   most observations from the previous ‘narrow’ distribution
*   some observations from a much wider outlier generating distribution

and the end result being that our distribution is no longer perfectly normal. In other words, it means we will:

*   sample from the gaussian `N(0, 1)` with probability `1-p`
*   sample from the gaussian `N(0, (1+a))` with probability `p`

where we set `p` to be a small number s.t. only occasionally do we get observations from the outlier-generating Gaussian. We can see that when we set `a=0` we return to the previous world where we have a constant variance of `1`. Now let's do the following:

*   repeat the previous sampling but with the above procedure in place
*   repeat this for different values of `a`

We’ll fix the probability `p=0.01`.

![png](https://cdn-images-1.medium.com/max/800/1*CfPG0K_8RuHpp4kY9ezt_A.png)

Image by author

What does this show? Starting on the far left it shows that when `a=0` we return to the perfectly Gaussian world and STD trumps MAD in terms of relative efficiency (RE). **However as we start to incorporate non-normality into our data this quickly flips with MAD at times being 12x more efficient as STD.**

#### Why?

One reason is to think about how MAD and STD are formulated. STD creates positive values for each deviation through squaring them. We can think of this squaring like applying a weight to each deviation where the weight is just the size of the deviation itself. By this merit larger deviations get a larger weight. When we incorporate non-normality as we have done above we end up with some large deviations (over and above the Gaussian) that accordingly cause the standard deviation to increase over and above what happens with the equal-weighted MAD function. It is this response to outliers that creates the variability in the STD statistic that causes it to lose its efficiency.

It is also this property that causes students to be taught at school to ‘remove outliers’ — because they ruin the standard deviation’s efficiency. All of this leads to the second reason for the dominance of the standard deviation.

#### Standard deviation is intrinsically linked with normality

This point becomes increasingly obvious the more you look at it — even the symbol for population standard deviation is the same as that for the scale parameter in the normal distribution. In a distribution with no higher moments (perfectly symmetric, no excess kurtosis) all you really need is the standard deviation. For a convex-concave-convex function like the bell curve once you have the mean and standard deviation you’re done — you have enough info in those statistics to describe the full distribution.

This point and the unique nature that the standard deviation plays with the normal distribution is beautifully illustrated in [this post](https://stats.stackexchange.com/a/3904). It’s well worth a read but I’ll attempt to paraphrase. Let’s assume the following:

*   we have a box with a load of tickets that have the numbers 0 or 1 written on them
*   we pick out `n` tickets and add up the numbers written on them - call this summed value `y`
*   we do this 10,000 times

We can then look at the values of `y` we have and create a histogram where we count the number of times a certain `y` appeared. For example if we set `n` equal to 10 then we will draw 10 numbers (either 0 or 1) for each `y`. The max we can get is 10 and the min 0 and we expect the mean to be 5 (`n/2`) - as on average we expect 50% of the time to draw a 0 and 50% a 1. If we were to plot that histogram we would end up with a bell curve, and as we increase the number of sample the more smooth our bell curve should become.

![png](https://cdn-images-1.medium.com/max/800/1*8PHrFOgN8o6kGOjHseq-ZA.png)

Image by author

As `n` grows the probability of getting any specific number grows small (as there are so many to choose from). We can't really see this in the above charts because I've removed the axis labels. However, given that a histogram represents frequency by area of the bars, the `height * width` of each bar grows smaller and smaller as `n` gets larger (from left chart to right chart).

We can tackle this scaling issue through normalisation — instead of just taking the straight sum of values, `y`, we can instead centre them by subtracting some middle value `m` and scale it down by using some dispersion value `s` to create `z`:

![336332e6-3ba8-424a-8992-ab44777c9a2e.png](https://cdn-images-1.medium.com/max/800/1*Bvkn__GyMT8r_bQSS7JqSA.png)

Image by author

We can then plot a histogram of _these_ values — the `z`'s. **Central Limit Theorem is concerned with the areas of this histogram and this is where the standard deviation comes in.** CLT states that as `n` grows large the area of these normalised bars on a histogram for the quantity `z` approach a limiting value - for some choice of `m` and `s`.

**It turns out that the unique choice of** `**s**` **in order for this to be true is that of the standard deviation.** In other words, no other measure of dispersion will do the trick (like MAD). I think fundamentally this demonstrates how intrinsically linked the notion of standard deviation is to the normal distribution — there is no CLT without standard deviation. The standard deviation is the only measure of dispersion we can use to ensure that the limiting distribution of the above histogram becomes the normal distribution.

#### Is STD’s dominance problematic?

As always: it depends. If we’re in a world of pure Gaussian-ism due to either:

*   having a sample that is truly large enough that CLT has properly kicked in (and not where we are only half way on the way to convergence)
*   a truly gaussian variable (usually constructed from games of chance where the rules are fixed by creation)

then we don’t need to worry.

However, for more real world cases where we are faced with symmetric distributions that aren’t perfectly normal, it’s worth thinking about using MAD as an alternate measure of dispersion. Especially if we end up in the realm of large deviations where these large deviations are actually the _only_ ones we care about as they are the events that dominate all else (one catastrophic flood vs a series of small rain showers). If you find this stuff interesting then further info can be found [here](https://emilkirkegaard.dk/en/wp-content/uploads/Revisiting-a-90-year-old-debate-the-advantages-of-the-mean-deviation.pdf) and [here](https://royalsocietypublishing.org/doi/10.1098/rsta.2014.0252).
