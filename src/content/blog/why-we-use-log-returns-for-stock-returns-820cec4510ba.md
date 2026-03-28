---
title: "Why we use log returns for stock returns"
pubDate: 2022-02-28
description: "Python simulations, convexity corrections and lots of pretty graphs"
heroImage: "/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-0.jpeg"
---

![](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-0.jpeg)

Photo by [Maxim Hopman](https://unsplash.com/@nampoh?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/stock-market?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

When looking at modelling stock prices it is almost taken as given that the idea is to model ‘log returns’. In reality we have gradually arrived at this over the last 150 years and failing to understand why can lead to some glaring errors, with these glaring errors leading to costly mistakes if you work in finance.

Despite being a fundamental of asset price modelling sometimes it’s nice (we all have our kicks) to understand exactly how we got here by working through what the statistical implications are of this approach. The aim is to do the following:

*   examine the concepts of simple and log return
*   build these up to multi-period ideas
*   add randomness
*   again, build these up to multi-period ideas

all in an effort to tease out exactly why log returns are the preferred way to model stock returns, before walking through an example using the S&P500 of how mixing up the different return concepts can lead to costly errors.

#### ‘Simple’ Return

Let’s start by defining exactly what we learned in school as percentage change:

![efbe4e1b-6a93-4123-a411-af9fb365c09d.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-1.png)

Image by author

where we have:

*   `r_t` as the 'simple' return for period `t`
*   `S_t` as the stock price at time period `t`

So if we have a previous stock price of `100` and a new one of `110`, then we have `(110 - 100) / 100` = `10 / 100` = `10%`. We can then rearrange this expression so that we have a 'model' for what a stock price should be in a future period of time:

![40853581-01cb-43c3-9344-d9e1926f06ea.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-2.png)

Image by author

So if we define `r = 9.00%` then we get from a starting price of `100` the new price of `109`. So far, so 'simple'.

#### What happens when we want to have multiple periods?

So the above shows us how we can model the next price from the previous price. What if we want to model the price a few periods down the line? Well for `T` periods we can write the following where:

*   we assume that `r` is defined over the whole period `T`, and so one period has an `r` of `r/T`
*   we have assumed that `r` is constant and so equal in all time periods

![6da2e3dc-37b6-42b6-846f-ea2496b8444f.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-3.png)

Image by author

So how does this look? Let’s now do the following — if we want to model a stock having a `r = 9.00%` simple return over a period let's see how our final price compares to our initial price if we keep breaking that period down into smaller chunks.

![png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-4.png)

Image by author

**So it seems like the final price we get will depend on how many periods we sub-divide our chosen time frame into.** This isn’t really all that great as it means that the return we get is tied to the time horizon we use to define our return e.g. if we define our return (as we have done) as 12.00% for a full period e.g. a year, then when looking at a period of 1 month we will not get a return of 1.00%. Instead to accomplish 12.00% over a 1 year time frame we would need to have the following 1 month returns:

![53baea53-492f-4c32-bb68-5b9cc9dd5670.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-5.png)

Image by author

which gives monthly returns of:

![f774122d.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-6.png)

Image by author

#### What number does it seem to be approaching?

So in the above chart it appears like after around 40 sub-divisions we seem to be getting close to approach a limit — what is it? It turns out that the above expression in the limit (as the number of sub-divisions heads to infinity) tends toward the [‘exponential function’](https://en.wikipedia.org/wiki/Exponential_function) i.e.

![682d06a4-5c22-4ae2-ad86-c7a8bbe55ca5.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-7.png)

Image by author

We can see this when we re-draw the above chart but with a horizontal line included for this limit.

![png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-8.png)

Image by author

#### Why does this happen?

Put into words, the above says the following — when we sub-divide a ‘discrete’ time step into an infinite number of infinitely small steps we end up with the exponential function as an upper limit. Why?

**Compounding**. The exponential function is all about compounding and when we divide a change into smaller and smaller sequential time steps — then previous changes will impact future changes. We can again see this graphically by comparing a straight ‘linear’ return e.g. 1% every month vs the compounded one.

![png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-9.png)

Image by author

So we have this criss-cross line that shows the compounding effect over multiple periods that eventually accounts for the ~0.70% difference between `12%` and `exp(0.12) = 12.749%`. So can we use this to re-define returns?

#### ‘Log’ Returns

If we use the above and are comfortable with the idea that we move to infinitely small steps with infinitely many periods, then yes — we can re-arrange the above formula to get:

![4ca26c84-b303-43b3-9025-7b7428c7bc6b.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-10.png)

Image by author

which we will call ‘log returns’ as the return r is defined as the log of the price ratio between final and start prices. So the next question becomes:

#### Does this solve our problem of different return numbers for different time periods?

Let’s go again with this one. If we rearrange to define our price series as:

![2c901e13-25ad-4933-b8bb-a12261814398.png](/images/blog/why-we-use-log-returns-for-stock-returns-820cec4510ba/image-11.png)

Image by author

then we can get an idea of how to get a price after a few steps:

![1d72baae-757a-4735-bfa5-a9bf06d8364e.png](https://cdn-images-1.medium.com/max/800/1*FBa2hnV3P_Lu2R9su8I7Og.png)

Image by author

So at least algebraically it looks like we check out as our returns are ‘additive’. This can be rephrased as the following:

![f9a8d699-3244-4854-aa1e-0389a7547693.png](https://cdn-images-1.medium.com/max/800/1*NQh9BdiFd0IgvrhBjLnFyA.png)

Image by author

where the additive property of logs has been leveraged. Now re-plotting our previous graph to compare the returns if we sub-divide our period into different numbers of sub-divisions:

![png](https://cdn-images-1.medium.com/max/800/1*fKaZb5jloHKJrotDJ9hyjg.png)

Image by author

So yes — it solves our problem of having different returns over a full period based on if we break down that period into smaller chunks. This is great.

#### Introducing: Randomness

So far all we have looked at is the properties of deterministic time series — there has been no randomness just a fixed rate of return, `r`. Now let's add some randomness into the picture to reflect the fact that stock prices don't just move rigidly in straight lines. To do this, let's return to our simple model again of a single time period and work our way back up.

#### Simple Returns with randomness

Let’s forget the fact that we have established the problem with simple returns being not time period homogenous and re-define our stock price ‘model’ as:

![dee65f08-51b5-4148-88a8-7f0b86b0366f.png](https://cdn-images-1.medium.com/max/800/1*Q7sHcnBSU9_QXjVsxBNXFQ.png)

Image by author

There’s a lot to take in here but in essence what we have defined is that instead of our simple return being just a fixed change, we have:

*   a fixed component `r` that remains from above
*   a new variable component, `epsilon`, that follows a standard normal distribution and is scaled up and down by a scaling parameter, `sigma`, depending on how volatile we want the stock to be

The normal distribution assumption is significant but useful for now as it allows us to use standard deviation as a complete measure of dispersion as ‘higher order moments are zero’ i.e. once we know standard deviation we don’t need any more info about the distribution to characterise its spread (like skew or kurtosis).

#### What’s going on with that square root of T bit?

This is the idea that variance is linear. If we define our standard deviation as a measure over the full time period (i.e full year as is commonly done with annualisation), then we need a way to chunk this _annual_ deviation down into smaller chunks (like _daily_ deviations). To do this we have the following:

![0e347608-3b77-406d-837f-bbc46d5314de.png](https://cdn-images-1.medium.com/max/800/1*VZa2-c9la65KSe1AES2doA.png)

Image by author

And so for standard deviation we get the following:

![95567a08-9df7-4dfa-8c88-e69417e4b92f.png](https://cdn-images-1.medium.com/max/800/1*L-cMHSEipwslIDJxQLD6YQ.png)

Image by author

#### Can we plot this using Python?

So now we have an idea of what our returns _should_ look like, let’s run a few ‘simulations’ to see if this plays out in the data. To create our random numbers we will use NumPy — if you’re curious about what is happening under the hood here I’ve written an intuitive explainer [here](https://towardsdatascience.com/where-does-python-get-its-random-numbers-from-81dece23b712).

![png](https://cdn-images-1.medium.com/max/800/1*rj6xMno10bLY6r1V2CbNOg.png)

Image by author

```
Negative prices: -20.53, -7.01, -5.67, -4.86, -2.38, -1.95, -1.65, -1.28, -0.34
```

So how does this look:

*   we have a mean final price of 112 which lines up with what we inputted — a mean return of 12%
*   the distribution of final prices and returns is incredibly ‘normal’
*   the standard deviation of the returns is exactly 30% which is what we entered

However we have a very clear problem — **we have negative prices for some large negative deviations**. We will address this, but first let’s see if we also have the problem we had for non-random simple returns when we moved from single to multi-period: that the return depended on how many periods you divided it into.

#### Multi Period Simple Returns with Randomness

Let’s augment what we had before to now include our randomness:

![9c949240-998f-4ab4-85c7-f42b526ef6d4.png](https://cdn-images-1.medium.com/max/800/1*_NopcN4iyhRnkdeUt2wiew.png)

Image by author

and so we define our final price as:

![44fe079f-ff5d-46ab-bec7-4740c2c072fd.png](https://cdn-images-1.medium.com/max/800/1*4MlBjqkyuKQPBEch5cGPSQ.png)

Image by author

We can see here again that if we remove the randomness and let the time periods become infinitely short (and their count infinite), then we head towards the geometric return:

![8f25cdfd-3b0e-43f7-a9fd-bd9e4da58a0c.png](https://cdn-images-1.medium.com/max/800/1*MB4yJXsjNGmvRCoNHQ8fag.png)

Image by author

The issue here is that **the random numbers make the return each period different** and so we have the product sign rather than taking the exponent. Let’s see if we get a mean return that is closer to the exponential return when we sub-divide our period.

Let’s sub-divide into 250 parts to represent roughly the 250 trading days of a year and then plot the paths we have generated:

![png](https://cdn-images-1.medium.com/max/800/1*sxpLzntu8N3UOsKTyvTCAA.png)

Image by author

What can we see here:

*   the paths have a distribution to them — most paths end in the middle with some wild ones on each extreme
*   overall the distribution looks slightly skewed upwards: there are some paths with more than +100% but few below -50%

Let’s plot the distributions now of final prices and the distribution of their **_simple_** returns

![png](https://cdn-images-1.medium.com/max/800/1*uJrLqSIjfHQOjcpKau4icg.png)

Image by author

So we have a mean where we would expect — around `exp(0.12)` - but the distribution looks off as we have:

*   greater than 30% standard deviation
*   a skewed distribution of prices and simple returns

Why is this the case? For that, let’s look back at what happened in the non-random case when we made the periods smaller and more frequent.

#### Compounding with uncertainty

So when we had the non-random case, we found that splitting time into smaller and smaller chunks resulted in a higher (because we assumed a positive deterministic return) overall return due to compounding and that this approached the exponential function. With uncertainty, we have the following phenomenon:

*   if we have a path made of 10 steps with either +10% or -10% return (not a normal distribution, one or the other — either +10% or -10%)
*   there will be some paths with either all 10 steps as +10%, and some with all 10 steps -10%
*   these finishing prices will be either:
*   100 \* 1.1¹⁰ = 259.37 -> simple return 159.37%
*   100 \* 0.9¹⁰ = 34.87 -> simple return -65.13%
*   clearly the upside compounding results in a closing price much further away from the start than the negative compounding

The above gives some intuition as to why when we have uncertainty we end up with this skewed distribution. The majority of paths will bumble around the middle (up, down, up, down) but there will be some that consistently compound in the same direction with the upside compounding more (in simple returns) away than the downside.

#### Logarithmic returns with randomness

Let’s now do the counterpart to what we did with non-random returns and have a look at this limit case where we divide time into infinitely small chunks. We define our logarithmic return for a period `t` as:

![cf579b2f-d8f9-4d34-8e3a-aba750d11d22.png](https://cdn-images-1.medium.com/max/800/1*VxLtyAIjYvDSunRoBq1b2Q.png)

Image by author

In other words, just like simple returns we define it as a deterministic bit of return, `r`, and some random bit which for now is assumed to be normally distributed and scaled by our chosen amount of variation, sigma. How does this look if we draw 10,000 samples?

![png](https://cdn-images-1.medium.com/max/800/1*4NXR15J5FBGvR_NHWHQGhg.png)

Image by author

So again we don’t have the symmetric distribution here. We also have:

*   a mean ending price of `117.98` and hence simple return of 17.98% (whilst we inputted 12.00%)
*   a standard deviation of simple returns of 36.15% when we inputted 30.00%

We seem to be building up a load of questions here so time to get into the stats to answer them.

#### What do we ‘expect’ the mean simple return to be when we model with log returns?

In other words — if we build our stock price series using log returns but then compute the simple return after we have built it — what do we expect this to be? Let’s take the above model for returns as logarithmic again over a whole period (so we remove the T’s from the equation):

![9ff7b9df-1943-46ac-9385-ab2a303a7c48.png](https://cdn-images-1.medium.com/max/800/1*AhYdIb2uPhrPpw_lvkSsNQ.png)

Image by author

Now let’s rearrange so we have it in terms of price, `S`, and then define simple return:

![06318866-36a2-40bb-bea6-a41c1505f8dd.png](https://cdn-images-1.medium.com/max/800/1*fC0tBWy62TNlfnD9PA9Dqg.png)

Image by author

Let’s also now re-define our random component to instead of having a mean and variance of 0 and 1, to represent our return, `r`, and standard deviation sigma:

![906d70be-8b36-48f3-a974-bb98e0bacc83.png](https://cdn-images-1.medium.com/max/800/1*Y3pMThW6hA4CZynDrsTW_g.png)

Image by author

Now from the above we were implicitly expecting the following:

![8ef1bcad-909b-4ae3-bbc2-84ada599e5cf.png](https://cdn-images-1.medium.com/max/800/1*C9vbKJnrlBAJSEFNDdDT5A.png)

Image by author

which clearly isn’t true. So where are we going wrong? **Inside that expectation operator.**

#### So what should it be?

Now it’s time to get into the stats and tease out the relationship between log and simple returns. Let’s set up the problem formally then tear through it to reveal why we seem to have this discrepancy between the distributional properties of the simple returns when we build the simulations using log returns vs what we input into the model.

Let’s define `X` as this quantity we care about:

![f4c70276-6905-46a6-90ea-9655dd4f605e.png](https://cdn-images-1.medium.com/max/800/1*USqaLjvnTOS6BpOIuGJgrg.png)

Image by author

What is the expectation of `X`? Given that `X` is now the definition of a log-normally distributed variable we know that the probability that `X` at any point is equal to a certain value `x` is:

![eb52535b-be8e-4c28-9bb9-5801471bf25b.png](https://cdn-images-1.medium.com/max/800/1*NEXiIPOmKD-tk8ZnAKb1dA.png)

Image by author

So for us to take the expectation of this we have the following — the value of each `X` multiplied by it's probability of happening:

![41a64d10-32e4-4f35-b337-07d27a505719.png](https://cdn-images-1.medium.com/max/800/1*92WFummlFv5waYg1S1iKZw.png)

Image by author

which we can:

*   cancel those `x`'s at the start
*   change the bounds on as the log normal has no probability below zero (so start integral at zero)
*   chuck some constants outside the expectation operator

![7534d4b3-19c9-4b3b-b762-6e4c9df76738.png](https://cdn-images-1.medium.com/max/800/1*npdwBNkNCEvkIB3mbtp7AA.png)

Image by author

Now let’s do something a little clever to simplify this a bit. Let’s make a ‘change of variables’ so that it becomes easier to simplify down. Let’s restate the following:

![e9db4338-2131-4f50-97c8-9881fff677c0.png](https://cdn-images-1.medium.com/max/800/1*mxZ8m8YJfRgy0XNn_4U-jA.png)

Image by author

which means we then also have the following:

![21362df8-40f5-4ba3-ab72-840405a54272.png](https://cdn-images-1.medium.com/max/800/1*lu4Ojutztz7uS_GaG4YI9g.png)

Image by author

which now means we can substitute all these things in and get the following:

![51038fcb-7eb2-41cd-bc45-cf0b2ca78be4.png](https://cdn-images-1.medium.com/max/800/1*cf6yppPoSJuUVJCjfzf4ow.png)

Image by author

Now we can:

*   cancel the sigmas outside of any exponents
*   re-arrange our terms in the exponents so that we can collapse one to be a square

![bd277270-a59b-4d9c-91cb-6681daaabd1e.png](https://cdn-images-1.medium.com/max/800/1*eanExMQO-7P1K21a99zokw.png)

Image by author

And now we rearrange once more:

*   pull that last bit out as it does not depend on y and so is constant in this integral
*   put the start bit back inside the integral (for aesthetics to see how it collapses)
*   collapse the middle exponent so the square is outside the brackets

![3e8068f6-55d0-45fd-bb0c-8baa317df13f.png](https://cdn-images-1.medium.com/max/800/1*o8aV92iZoiuNnR9Vn7SGHQ.png)

Image by author

Now what have we got left inside our integral? We have the formula for a Normal Distribution CDF with:

*   mean of `sigma`
*   variance of `1`

which means it has an integral of 1 which gives us our final answer of:

![56830195-b9d6-46dd-9a37-aa2ee4a7ea88.png](https://cdn-images-1.medium.com/max/800/1*DDTR9oiSKDGhmCROaA6Phg.png)

Image by author

#### Right, so how does this tie back into our discrepancies?

So we have just proved that, in theory, the following should hold:

![8853e558-630e-462f-a346-e7ceb29224e3.png](https://cdn-images-1.medium.com/max/800/1*6PsCzDiG1E9Vk6njzpOiSA.png)

Image by author

So what does this give us — well it turns out that `100` \* `exp(0.12 + 0.5 * 0.3^2)` = `117.94%` which is almost exactly what we get above in our simulations as our mean.

#### Okay so we can line up — but why? What’s the intuition behind the return being higher?

**Compounding**. Once again the answer lies in compounding — this time embedded in the exponential function. As we showed earlier, the distribution changes shape when we start to sub-divide our returns into smaller chunks with uncertainty. We get paths that are further away on the upside from our initial price than downside. The exact same thing is happening here due to the shape of the exponential function. We can see this graphically if we plot a given simple return vs the corresponding log return we would get.

![png](https://cdn-images-1.medium.com/max/800/1*dqT5twHHifngZa0CcvHXgQ.png)

Image by author

In other words:

*   every time we get a positive random fluctuation, the exponential function makes it larger
*   every time we get a negative random fluctuation, the exponential function makes it smaller

So when we average these we don’t get zero as the positive fluctuations have been magnified and the negative diminished. It also makes sense that the larger the deviations the larger the difference in this mean as the difference between the two lines increases with larger moves.

#### Can we plot this relationship so we can visualise the difference increasing with higher variances?

Yes — to make sure this is absolutely clear, let’s do the following:

*   for a given variance draw a load of numbers from a normal distribution
*   using those numbers:
*   compute closing prices using simple returns
*   compute closing prices using log returns
*   compute the mean simple return and mean log return of these prices
*   difference these means
*   compare this difference to the difference we would ‘expect’ based on the above ‘variance adjustment’ i.e. the log numbers should be higher due to this exponential effect on the random component
*   repeat this for a range of variances and also larger numbers of simulations to ensure that the Law of Large Numbers (LLN) holds and we converge to the theoretical expectation

Bit of a mouthful all that but the pretty graphs should make it clear.

![png](https://cdn-images-1.medium.com/max/800/1*MBlyrN2Oh2cUcvklypv6IA.png)

Image by author

So it looks like we’re lining up:

*   there is more noise in the small sample paths but Law of Large Numbers starts to pull through well
*   interestingly there is more noise at higher levels of variance
*   the difference between mean logarithmic return and mean simple return lines up with what we proved theoretically

Great!!! We now have a model that incorporates randomness and we understand how it generates the returns it does!

#### Multi Period Log Returns with randomness

So all that’s left is to see if we can extend our log return model to have multiple periods (as well as randomness) and see if this impacts anything. Let’s look at how we can define a multi-period return using a combination of single period returns:

![af6f299f-467e-47c6-beb6-b75b41d10ef2.png](https://cdn-images-1.medium.com/max/800/1*Z6ZcuudY9Rkjke5nBlTJOQ.png)

Image by author

so through re-arranging we can see that we can make our logarithmic returns additive. We can then exponentiate to get our final prices then compute our simple returns based on that.

![3b2278cd-c239-4f48-92a2-d644bb360487.png](https://cdn-images-1.medium.com/max/800/1*-CMJC76uIyMQG1Ks_c9LxA.png)

Image by author

![png](https://cdn-images-1.medium.com/max/800/1*VlyhOBJWIJzNtPiWwRKxGg.png)

Image by author

![png](https://cdn-images-1.medium.com/max/800/1*shcsjENNgxjNgN63akVpZg.png)

Image by author

#### What about the variance? Why is it larger for log returns than in our simple return model?

Again this boils down to how we are computing our standard deviation. If we compute the standard deviation of the log returns then it will exactly equal 30.00% — as we can see in the right-most chart above. However if we compute the simple returns, after having modelled our price series using log returns, then we get a different (larger) standard deviation.

Why? This isn’t exactly a full proof answer but for the same reason as our mean return is higher — higher mean simple returns will mean higher deviation of simple returns to achieve that. It’s not exact but:

*   if we look at our ratio of simple returns i.e. `18%/12%` = `1.5x`
*   multiply our variance by this amount i.e. `30^2 * 1.5` = `0.135`
*   compute the standard deviation i.e. `sqrt(0.135)` = `~36.75%`

which roughly is the standard deviation of our simple returns above of 36.10%. Mathematically, the two are actually linked by this formula:

![49093b73-88d9-4c30-bf00-89cdc4da1f3e.png](https://cdn-images-1.medium.com/max/800/1*h0cIMTLTgmiyd3qll6ZxfA.png)

Image by author

which when computed gives us exactly 36.20% which is approx we have above.

#### Recap

So what have we established?

*   the desire to have time-increment homogenous returns and non-negative prices naturally brings us to log returns
*   when we simulate using log returns but then calculate the simple return of each simulated path, we end up with a higher return and variance than we entered into the simulation
*   this is because of the compounding effect of the exponential function when applied to random deviations

with the implication being that **we need to be very careful when talking about return — calibrating a stock price simulator built using log returns to a simple return number will give us the wrong distribution of final prices.**

#### An example perhaps?

Let’s take the example of the SPX and use that data to calibrate some simulations.

![png](https://cdn-images-1.medium.com/max/800/1*URIzEsoEPNo4Jab9afapZw.png)

Image by author

So we have our dataframe of spx returns — both simple and log. Let’s plot their respective distributions:

![png](https://cdn-images-1.medium.com/max/800/1*jOlOhTRC8Mqoix6JIsJWtw.png)

Image by author

So we have the following:

*   SPX daily returns clearly not normal but let’s glance over that for now
*   SPX has a mean daily (annualised) simple return of 9.00% and standard deviation of around 21.00%

Let’s use these numbers (instead of the correct log return numbers) to calibrate our simulations.

![png](https://cdn-images-1.medium.com/max/800/1*VTqjJtk1eFJsuBx0vn6XzQ.png)

Image by author

So what have we done?

*   taken the simple return stats
*   calibrated our log-normal simulations with these simple return numbers as our inputs for `r` and `sigma`
*   computed our closing price simple returns outputted by the log-normal model

We can clearly see that we have data for the simple returns that does not match what we desired — 9.00% with 21.00% volatility. The chart on the right shows that the model has done its job — as the log returns are exactly as inputted. **However this clearly shows the issue with mixing up the 2 different notions of return.**

#### Concluding remarks

We’ve introduced the ideas of simple and log returns and shown how simulating stock returns under uncertainty leads to modelling logarithmic returns as the natural choice. In the above we have assumed that random deviations are normally distributed however this isn’t necessary — we can extend this to model any calibrated distribution of returns whether that incorporates skew, kurtosis or even infinite variance processes where returns follow distributions from the Pareto family.

* * *

Schedule a DDIChat Session in [**Coding, Software, and Mobile Development**](https://app.ddichat.com/category/coding-software-mobile-development "https://app.ddichat.com/category/coding-software-mobile-development")**:**

[**Experts - Coding, Software, and Mobile Development - DDIChat**  
_DDIChat allows individuals and businesses to speak directly with subject matter experts. It makes consultation fast…_app.ddichat.com](https://app.ddichat.com/category/coding-software-mobile-development "https://app.ddichat.com/category/coding-software-mobile-development")[](https://app.ddichat.com/category/coding-software-mobile-development)
