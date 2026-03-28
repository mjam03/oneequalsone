---
title: "Why is the sample variance distributed with n-1 degrees of freedom?"
pubDate: 2022-02-02
description: "Mashing together intuitive derivations littering the web"
---

![](https://cdn-images-1.medium.com/max/800/1*tBIyyKQ7OF56cpkVHcwAEA.jpeg)

Photo by [Antoine Dautry](https://unsplash.com/@antoine1003?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/maths?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

This is something I always struggled with — half because I didn’t really feel comfortable with the chi-square distribution, half because the idea of ‘degrees of freedom’ seemed incredibly vague. Most derivations are either:

*   symbol **heavy** with lots of largely unnecessary maths chucked straight in your face
*   end up _technically_ proving why it has `n-1` degrees of freedom but somehow leaving you non the wiser

Either way, the intuition is the bit lacking. Fortunately, there are some great explanations of why this is the case littered around the internet. Well, mostly on [Cross Validated](https://stats.stackexchange.com/) — the stats Stack Exchange. The aim here is to pastiche them together into something that is intuitive without cutting out the unnecessary maths to make the point. If you have the time the original posts are from some very clever people and worth a read on CV [here](https://stats.stackexchange.com/a/532771), [here](https://stats.stackexchange.com/a/3934) and these non Cross Validated ones [here](https://online.stat.psu.edu/stat414/lesson/26/26.3) and [here](https://statproofbook.github.io/P/norm-chi2).

#### Why does it matter?

Because having a good understanding of our sampling distributions is important. Rarely in life will we ever know:

*   the distribution of our data
*   the true population mean
*   the true population variance

and so all we have to go on is collecting samples, computing sample statistics (e.g. sample mean and variance) and then checking them versus some hypothesised values. Without knowing what distribution these sample statistics should follow we can’t make any statements about how likely it is that the sample value we got vs our hypothesised population value is:

*   just by chance
*   unlikely to be by chance, and we can accept that hypothesised value as true with a ‘degree of confidence’

The above process is called ‘hypothesis testing’ and knowledge over our sample statistic distribution allows the above ideas to be quantified.

#### What are we trying to prove?

The idea is this: we have some variable, `X` - it could be anything. Actually no it can't be anything. We don't need to know much about `X` but the one thing we do need to know (or impose) is that it must be normally distributed. We don't need to know the true mean or variance of `X` - just that whatever it is it follows a normal distribution. Classic examples of normally distributed phenomena are natural things - height, shoe size, birth weight etc. The assumption that we live in a classical bell-shaped statistics land is fairly huge but is required for this particular statistics result.

Given this variable, `X`, we can then form a sample `x_1, x_2, ..., x_n` by collecting `n` observations of the variable (e.g. recording random people's height), each called `x_i`. As mentioned we don't know what the true mean and variance of the random variable `X` is, but we can 'estimate' those things by using our sample data to 'infer' them.

We can write the sample mean as:

![de1ecc9c-03ec-4672-b6f7-86d8156d74ff.png](https://cdn-images-1.medium.com/max/800/1*8FGB-fDR0alnJOHxnpxNcg.png)

Image by author

and (corrected) sample variance as:

![c9973c0b-9d0b-4f33-86ba-8389951daed6.png](https://cdn-images-1.medium.com/max/800/1*jRm96eJLNjYDROzqO9-JoQ.png)

Image by author

We are trying to prove the following:

![38dce8c8-eba9-4fa3-8326-4759cbc8fd61.png](https://cdn-images-1.medium.com/max/800/1*dartnRDXwZNkfVcPCzFwhA.png)

Image by author

In words — that the sample variance multiplied by `n-1` and divided by some assumed population variance (because we don't know what the true variance is) follows a chi-square distribution with `n-1` 'degrees of freedom'.

#### Why is this the case?

Let’s just state the intuitive / non-mathsy result up front. Because:

*   we have assumed that each `x_i` is independent (e.g. your height doesn't impact my height - unless it's my ma reading this) and is an observation from a normally distributed variable
*   the sample standard deviation requires you to square these values at some point (as they are squared deviations from the sample mean)
*   squared (standard) normally distributed values is actually the definition of a chi-square variable

we should be expecting this variable, `V`, to be chi-square distributed. The `n-1` bit, rather than `n`, then comes from the following. In order to calculate the sample variance we need something to compute dispersion around. We don't know the true centre of the distribution (the population mean) but instead replace it by an estimate of it - the sample mean.

It turns out that the sum of squared deviations from the sample mean will _always_ be smaller than those around the true population mean. Because of this, our sample variance (if uncorrected) will always be an under-estimate of the population variance. The use of `n-1` instead of `n` degrees of freedom fixes this because the lower the degrees of freedom of a chi-square distribution the tighter the distribution.

**This slightly tighter distribution makes up for our under-estimate of the the true population variance. If we didn’t do this we would fail to reject hypotheses that the true population variance is smaller than it actually is.** Hopefully by the end of this you’ll be convinced that this is the right correction to make.

#### What does a chi-square distribution look like?

Before working through the derivation — let’s just plot:

*   a normal distribution
*   a squared normal distribution
*   a chi-square distribution

so that we can visualise what we are working with.

![png](https://cdn-images-1.medium.com/max/800/1*LDZphG89ZXTeRyr1QOjuSA.png)

Image by author

So on the left we have a standard normal distribution — nothing unusual here. Next, we have squared each of the values sampled from the normal distribution on the left. Given we’ve squared them every value is positive and the deviations from zero are larger than for the standard normal variable because a deviation of 2 becomes 4 etc etc.

Finally we have various chi-square variables — ‘various’ as each has different ‘degrees of freedom’ (dof). In simple speak, given that the chi-square distribution is what we get if we sum squared independent standard normally distributed variables (a real mouthful), then the degrees of freedom is just how many of them we sum. You can see this by how similar our graph in the middle looks to the chi-square variable with 1 dof — because our graph in the middle is what happens if we square just one value and don’t add on any other squared values.

To get the graph with `dof=2` we can just take pairs of normally distributed values, square them and sum them. If we did this 1,000 times and plot the results as a histogram we would get something very like the chi-square graph with 2 dof above on the right.

#### Does it make intuitive sense that our sample variance should follow this distribution?

Yes — for 2 reasons:

*   variance must always be positive and the chi-square distribution is always positive
*   our formula for sample variance involves squaring our normally distributed values and summing them up — which is very close to the recipe for a chi-square distribution

So without delving in too much it doesn’t seem inappropriate.

#### Why are we referring to ‘corrected’ sample variance?

The final thing before we get into the derivation for the distribution of the sample variance is to look at the definition of sample variance itself — why are we dividing by `n-1` and not `n` when we have `n` squared deviations from the sample mean?

This correction is called [Bessel’s Correction](https://en.wikipedia.org/wiki/Bessel%27s_correction#Intuition) and is the mathematical implication of the result stated above — that the sum of squared deviations around the sample mean will always be smaller than those around the true population mean. We can double check that dividing by `n-1` is the correct thing to do by computing the expectation of the corrected sample variance. If you are happy with this (or just happy to take my word that we should divide by `n-1`) then just skip ahead.

We can look at the ‘expectation’ of the _uncorrected_ sample variance (i.e. divide by `n` instead of `n-1`) as the following:

![18dcedbe-c143-4c30-a915-6ef01919ac41.png](https://cdn-images-1.medium.com/max/800/1*uDZop5ngaXbuCr603i2Wxw.png)

Image by author

where we have:

*   expanded the squaring
*   used the definition of the sample mean to simplify the right-most 2 terms post bracket expansion
*   brought the expectation operator ‘inside’, using the property of expectation that:

![6feee391-3ba5-46c7-aa1c-2eb1399e5bb5.png](https://cdn-images-1.medium.com/max/800/1*m2CWsxqB_Ljg706k2i0Hpw.png)

Image by author

Now we are left with two quantities that we need to work out — both of which we can figure out by re-arranging the following definition of variance:

![6f5d0bc6-51ab-4122-85f7-c7474d0e8f4f.png](https://cdn-images-1.medium.com/max/800/1*lO_0AtRwulOYUmFWQ3ztAw.png)

Image by author

Re-arranging and putting in our first context we have:

![c84154b4-c3f7-462f-b9de-194cd82d3bb8.png](https://cdn-images-1.medium.com/max/800/1*11GBmTI-RBbnIh5XV2FvyQ.png)

Image by author

which follows from the definition of the distribution of `X`. Then for the second context:

![16308a03-e955-4207-9872-792d998d100b.png](https://cdn-images-1.medium.com/max/800/1*LwjpXT956c9fAJT7P9z3IQ.png)

Image by author

Substituting both of these values into our original equation gives us:

![71bb19ff-abbc-493b-b518-d9c966ccd547.png](https://cdn-images-1.medium.com/max/800/1*TUVpoBf5laqhdptd0hVtqQ.png)

Image by author

In other words — if we divide by `n` instead of `n-1` our value of the sample variance will be an under-estimate of the population variance. How much do we undershoot by? **As we can see in the penultimate line we undershoot by the variance of the sample mean.** So if our sample mean is slightly higher than the true mean we will end up summing slightly smaller deviations than we should and vice versa.

Let’s demonstrate this in python — that using the sample mean rather than true population mean leads to an under-estimate. We will do the following:

*   draw 100 observations from a standard normal distribution (mean zero, variance 1) 100x (so 100 samples of 100 observations)
*   compute the sample variance of each sample using the _sample_ mean
*   compute the sample variance of each sample using the _population_ mean (just zero)
*   compare the 2 for all 100 of our samples and plot them

where we would expect the number calculated using the sample mean to be slightly smaller than that using the population mean.

![png](https://cdn-images-1.medium.com/max/800/1*bu_HrH-tCLtNpeKG2BDmQw.png)

Image by author

So the simulation backs up the intuition — the variation around the true population mean is always slightly higher than that around the sample mean. To correct for this we then need to raise our sample variance by dividing only by `n-1` and not `n`. If we actually knew the true population mean then we could use that instead of the sample mean as the centre around which we calculate our variability. In this case, we would end up just dividing by `n` instead of `n-1`.

#### Start the derivation

So given a sample of `n` observations, `x_1, x_2, ..., x_n`, from the random variable `X`, we know that if `X` is normally distributed as:

![6221e070-9464-4bbc-a332-18f0517adc8b.png](https://cdn-images-1.medium.com/max/800/1*XF_mXfjFZoW_uj0enUdY4A.png)

Image by author

then we can transform `X` into a _standard_ normally distributed variable `Z` by doing the following:

![d6e0ee08-4d96-4f45-9c6c-528fb44d3b61.png](https://cdn-images-1.medium.com/max/800/1*VFfTss6ouBiyLaJM9zjSxA.png)

Image by author

Or in words:

*   subtract the mean so that every observation is centred around 0
*   scale dispersion down by the standard deviation so we have a variance of 1

And by statement of the definition of a chi-square distributed variable we can have `Q` as:

![74b5f9cc-7445-4a72-ab11-751a65c850c1.png](https://cdn-images-1.medium.com/max/800/1*d7w-l5n0aaVI-O7Wm8xWcg.png)

Image by author

So we know that `Q` is distributed chi-squared with `n` dof. The clever bit here is to try and re-arrange the above formula so that we include our term for the sample variance. In the above formula we are centring our deviations around the true population mean - however, in practise we don't know what this is. We only have the sample mean to compute our deviations around. Let's start by splitting that out as follows:

![4c76a8a4-da2d-4f91-8c39-5a1aa7b5e6f1.png](https://cdn-images-1.medium.com/max/800/1*5SA3x8G-04VXTDJaTFOIqQ.png)

Image by author

where we have:

*   split the top into 2 expressions
*   expanded the brackets
*   moved constants that don’t depend on `i` outside the summations

Noticing that the final term is just the sum of (un-squared) deviations around the sample mean, from the definition of the sample mean this will be zero and so the final term disappears. We are now left with the following two terms:

![b64fb155-c87a-474d-98f5-660695f797c1.png](https://cdn-images-1.medium.com/max/800/1*rwD65lAqYEXgmaDvAhFraQ.png)

Image by author

#### First term: substituting in the sample variance

The first term in words is the sum of squared deviations around the sample mean divided by the population variance (a constant if known). Looking above at our definition of sample variance we can just sub this in to get:

![388000ba-8875-4115-b44a-71da6bb61434.png](https://cdn-images-1.medium.com/max/800/1*UxDNviJFWPKXdgR4VwHwhw.png)

Image by author

Now we have an expression where:

*   we know that `Q` is chi-square distributed with `n` dof
*   the first term in our expression is the exact quantity we want to check the distribution of!!!

If we can find out the distribution of the second term on the right then we only would be left to infer the distribution of the part we are interested in.

#### Second term: distribution of the sample mean

Our second term is the normalised sample mean squared. Given that we know that:

![842d2122-1af7-4461-84a9-8adecf37bb0e.png](https://cdn-images-1.medium.com/max/800/1*J0T4Apbam8CE8ANsrn8huA.png)

Image by author

![6773f60d-9e8b-4d21-a37e-97df505eb64e.png](https://cdn-images-1.medium.com/max/800/1*Hus4ZlSDOqvN3MSqONgX5Q.png)

Image by author

then we have the following result:

![8ef57125-669f-4d31-8583-0f086e7cf6b4.png](https://cdn-images-1.medium.com/max/800/1*rUBMX9lIfSbyYClaKlWCew.png)

Image by author

If we square a standard normal variable then we get a chi-square variable with 1 degree of freedom. Squaring the above term gives us:

![51a0c7b2-b590-4ea3-89c2-0b40cce76717.png](https://cdn-images-1.medium.com/max/800/1*3zWhCAWucOf8pV_2DxllOw.png)

Image by author

which is our second term in the above equation for `Q`. Substituting in what we know distributionally about the above equation we get:

![7b10b7b5-a9a0-41d5-8db4-ae1fc4364db2.png](https://cdn-images-1.medium.com/max/800/1*bQOCjq5OX-K4fxAaDIJmRA.png)

Image by author

#### Making the final leap

For me, the above is good enough that I feel convinced — in order to balance the above equation distributionally then what we care about (first term on right side) should have a chi-square distribution with `n-1` dof.

However formally a bit more is required — in order to complete the proof we:

*   need to prove that the sample variance and sample mean are independent such that the two terms on the right of the above equation are independent of each other
*   once that is proven we can then cite [Cochran’s theorem](https://en.wikipedia.org/wiki/Cochran%27s_theorem) that they are independent chi-square variables
*   use the uniqueness property of moment generating functions (MGF) to demonstrate that the variable we care about has the MGF of a chi-square variable with `n-1` dof, therefore it must be distributed as such

If you fancy checking this out then I recommend the last bit of [this post](https://online.stat.psu.edu/stat414/lesson/26/26.3), but for me that’s good enough along with the intuition provided.

#### A final bit of intuition?

One other line of argument I came across as to why we shift down the dof by 1 is from looking at the first decomposition we did when we had our variable `Q` - we didn't know the true population mean so we split out the top of the fraction to include both sample and population mean:

![72bcb8d0-f0df-46d8-8e38-908ffcc47f85.png](https://cdn-images-1.medium.com/max/800/1*ObnrD_wmT1fnhK1lP2v2iQ.png)

Image by author

This is a nice way to show that our sample variance only looks at the first term (the dispersion around the the sample mean) and not the second term (the dispersion of the sample mean around the true population mean). It’s this second bit of variation which we are missing in the data (we can’t know it without actually knowing the population mean) that means we need to use `n-1` instead of `n` in order to narrow the distribution of our sample variance.

#### Summary

Hopefully you’re as convinced as I am that this isn’t actually as mystifying as it first feels when you just get formulas and integration symbols thrust at you. The idea is quite neat — because we need to use the sample mean to anchor our measure of dispersion we miss out on some of the variance in our sample — the variance of the sample mean around the true population mean. As such when assessing our sample variance vs some hypothesised population variance we need to use a chi-square distribution with 1 less degree of freedom.

This distribution is slightly tighter to make up for the fact that our sample variance is a slight under-estimate of the the true population variance. If we didn’t do this we would fail to reject hypotheses that the true population variance is smaller than it actually is.

#### P.S. What about intuition for the idea of ‘losing a degree of freedom’?

Thought this was worth throwing in to round things off — taken from [here](https://stats.stackexchange.com/questions/58230/degrees-of-freedom-for-standard-deviation-of-sample/532771#532771). The term ‘degrees of freedom’ has always been a bit iffy for me and translated as roughly ‘moving parts in the equation’. By that merit we can think of it as the following. When we know the true population mean then the sample variance is distributed chi squared with `n` dof. However when we use the sample mean we 'lose a degree of freedom'. Why? Because when we use the sample mean we lose the independence between each normalised observation. In other words:

![c4117e9b-4cfe-40fb-91f4-7181a788b2c5.png](https://cdn-images-1.medium.com/max/800/1*Ni2bMY7kTLSfNfyY5k7aPg.png)

Image by author

For the first term, all observations (`x_i` minus mean) will be independent of each other; but the second terms won't be. This is because in the second expression **those observations are being used to compute the sample mean.** In the extreme case of `n=2` then if we know:

*   the first observation
*   the sample mean

then the second observation is not random as it must be the balancing act vs the first observation — in order to equal the sample mean. Because we ‘lose the randomness’ of 1 observation then we only have `n-1` degrees of freedom. It's not an argument that really makes sense in my head as to why we end up using a slightly tighter sampling distribution but it's still interesting.
