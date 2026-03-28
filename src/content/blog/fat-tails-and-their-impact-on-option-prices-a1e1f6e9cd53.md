---
title: "Fat tails and their impact on option prices"
pubDate: 2022-05-07
description: "Kurtosis, defining fat tails and counter-intuitive results"
---

![](https://cdn-images-1.medium.com/max/800/1*A5aLNVQW2r6i40hlyLBung.jpeg)

Photo by [Zdeněk Macháček](https://unsplash.com/@zmachacek?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/tail?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Option trading is usually associated with the words ‘convexity’ or ‘leverage’ with the assumption being that options are the best instrument to profit from large stock price moves — either positive or negative.

This opinion has been spurred on by depictions of optionality in movies such as the Big Short (Michael Burry and his CDSs) as well as popular commentary in January 2021 on the furore around WallStreetBets and their interest in GameStop.

Whilst options certainly do display leverage, the notion that all options gain from large price moves isn’t quite true. The aim of this article is to qualify this statement by:

*   defining what we mean mathematically by ‘large’ price moves
*   constructing a variety of distributions that display varying propensity to generate these ‘large’ moves
*   comparing option prices when priced in accordance with these distributions

#### Fat tails

‘Large’ price moves can only be deemed ‘large’ if in comparison to something else. A standard daily move on one stock or index may be considered ‘large’ for another if the other stock or index is much less volatile to begin with.

Stock price moves are commonly referred to as ‘returns’, in particular log returns, and we can take a sample of these and plot their frequency as a histogram. In doing so we can get an indication of what we consider to be a ‘standard move’ — something that happens a lot of the time — and then we can define what constitutes a ‘large move’ in reference to that.

For illustration we can do that with the SPX daily return series below in python.

![png](https://cdn-images-1.medium.com/max/800/1*BxXwexvmfKcOePVpV6sNew.png)

Image by author

So as we can see there are many many moves between +/-2% with a very small number outside e.g. +/-4% with the distribution overall being bell-shaped. However, as shown by the fitted Normal distribution (black line) the distribution is far from normal with many more small moves than the normal would provide and more larger moves in the ‘tails’.

In other words, once we have an idea of the scale of the distribution (whether that’s through variance or mean absolute deviation), ‘large moves’ can be viewed as moves that are in the tails of the distribution.

#### Where does the tail start?

When we look at bell-shaped distributions, it’s easy to say the tails are the thin bits on the left and right that continue ever closer to a density of 0. However theoretically deciding where they start is not such an easy task. Is it past 3 standard deviations from the mean? Or is it more like 2.5? Or maybe 4? Or does it have nothing to do with standard deviation at all?

There is no agreed upon definition of where the tail of a distribution starts. You can see [here](https://stats.stackexchange.com/questions/423330/identifying-the-tail-of-a-heavy-tailed-distribution) for 3 of the top contributors on Cross Validated (the statistics version of Stack Exchange) making this point clear to someone posing the question about where to define the start of the tail.

Whilst there may not be one agreed upon definition, we can still make use _a_ definition — this one borrowed from Nassim Taleb in the technical counterpart to his Incerto (Fooled By Randomness, Black Swan etc).

#### Defining the tail

We will make the following definition:

_“The tail of a distribution begins at the point where the probability density is_ **_convex_** _to_ stochasticising _the variance.”_

In simple terms, instead of just taking a given e.g. normal distribution with a fixed mean and variance, what if we took the average of 2 normal distributions where one has a lower variance and the other has a higher variance? In a way taking the average of these 2 distributions is similar to saying that the variance is ‘stochastic’ (in this case just 2 states — low and high).

To do this we will do the following:

*   compute the pdf for a normal distribution with variance of `1 - e`
*   compute the pdf for a normal distribution with variance of `1 + e`
*   average them
*   repeat for various values of `e`

Below shows the output of this:

![png](https://cdn-images-1.medium.com/max/800/1*TW4OefpDhDfCSO3gpbZf5w.png)

Image by author

The above chart shows our pdfs for various values of `e`, with `e=0` being equal to a standard normal distribution. What does it show?

*   all distributions as expected are bell-shaped
*   as we increase the value of `e` we start to get a more peaked centre around `0`
*   as we increase the value of `e` we start to get more density in the tails

But most importantly: **all versions of our distribution seem to cross at the same points**. These points are +/-0.66 stds and +/-2.13 stds and crucially we can use this to define the tails of our distribution. Using the above, we can identify the following components of a distribution:

*   the ‘tails’: the areas beyond +/-2.13 stds that see their probability _increase_ once we stochasticise the variance
*   the ‘shoulders’: the areas between +/-2.13 stds and +/-0.66 stds that see their probability _decrease_ as we stochasticise the variance
*   the ‘peak/body’: the area within +/-0.66 stds that we see _increase_ in probability due to stochasticising the variance

**In other words, as we fatten the tails of the distribution we do so by increasing the frequency of small moves and decreasing the frequency of medium moves.** To come back to our original definition, the tails are convex to stochasticising the variance because as we stochasticise the variance the probability of events here increases rather than decreases.

#### How does this fit in with people talking about kurtosis and fat tails?

Because kurtosis is the ‘4th moment’ or can also be seen as the variance of variance (variance being the 2nd moment). In other words, by stochasticising the variance we are increasing the variance of the variance (from zero for the normal distribution) and so generating distributions with more kurtosis.

We will see this excess kurtosis in the next section once we start sampling from these distributions to compute option prices.

#### How does this impact option prices?

Alright back to the original question — how does changing the distributions in this way to have fatter tails (and so a higher probability of larger moves) effect option prices?

To do this we will:

*   create a custom distribution class in python so we can sample from these distributions
*   sample `10,000` log returns from each distribution with the same variance and mean
*   use these log returns to compute closing prices
*   compute option prices based on these ‘simulations’ for various strikes and see how the prices change

Below is our custom distribution class that extends the standard SciPy framework for efficient sampling — if you are curious about how this works then I’ve written an explainer [here](https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-iii-8daa212ce554) on TowardsDataScience.

[**Random Sampling with SciPy and NumPy Part III**  
_Implementing custom distribution sampling in SciPy_towardsdatascience.com](https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-iii-8daa212ce554 "https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-iii-8daa212ce554")[](https://towardsdatascience.com/random-sampling-with-scipy-and-numpy-part-iii-8daa212ce554)

Now, assuming we have a stock with `S=100` and an annual volatility of `20%`, let's simulate `10,000` year end stock prices according to:

![eae78f6b-c3bb-45bf-ab50-6942e33f8f27.png](https://cdn-images-1.medium.com/max/800/1*ymF-LEgDOuu0Hm4lrDx7YA.png)

i.e. a Geometric Brownian Motion (GBM) with no drift. We will just simulate one period (i.e. the whole year in one step) and so this amounts to choosing `10,000` returns from our given distribution and using them to compute year end stock prices as:

![3b9638b4-b60b-4ca2-b852-a168f36c1c08.png](https://cdn-images-1.medium.com/max/800/1*MezYvhkpaEndrGkxmHRShw.png)

where `r` is the random number we have plucked from our distributions.

Let’s now do the following — compute option values for a variety of strikes based on year end prices generated by each of the above distributions. Note we’ll only compute time value of options to prevent the picture being muddied by intrinsic value. To do that we’ll just compute put prices for strikes below `100`, and call prices for `100` and above.

![png](https://cdn-images-1.medium.com/max/800/1*JZJcut38tqGNHI98pqzFTA.png)

Image by author

The above shows how the time value of these options varies as we vary the distributions to become increasingly fat tailed. The blue line shows us the default under the assumption of normality i.e. `e=0`. As we increase `e` and as a result fatten the tails of the distribution we generate our log returns from we can see that 2 things happen:

*   as expected the time value (and hence total value) of options with strikes away from our starting spot (`S=100`) _increase_ in value
*   the value of options with strikes close to our starting spot actually _decrease_ in value as we fatten the tails

So it seems like there are some options that actually don’t benefit from increasing the probability of having ‘large moves’. Why? Because we’ve reduced the probability of generating ‘medium moves’ in order to facilitate this tail fattening as shown above by our distributions losing their ‘shoulders’.

It might look like the changes in time value are fairly small, but we can re-plot the above by comparing our fattened distributions vs the normal and so plotting percentage changes in time value.

![png](https://cdn-images-1.medium.com/max/800/1*hTaWC1Ojl4jE0CAlbpKqcA.png)

Image by author

#### Conclusion

When seen like this we can see that ‘wing options’ — options with strikes far away from the current spot (or more accurately the current forward) — are the true beneficiaries of tail fattening. In reality this is what is being talked about when talking about options displaying true convexity.

These are the options that were being traded by the WallStreetBets gang on GME, these are the options that are seen to deliver huge profits in ‘tail events’ and these are the options that deliver the convexity that is idolised in movies like the Big Short.

* * *

Subscribe to DDIntel [Here](https://ddintel.datadriveninvestor.com/).

Join our network here: [https://datadriveninvestor.com/collaborate](https://datadriveninvestor.com/collaborate)
