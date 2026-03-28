---
title: "Where does python get its random numbers from?"
pubDate: 2022-01-19
description: "A simple explanation of modern pseudo-random number generators (PRNGs) and their new NumPy implementation"
---

![](https://cdn-images-1.medium.com/max/800/1*ApApJllf65Em_KUtIEhEEw.jpeg)

Photo by [dylan nolte](https://unsplash.com/@dylan_nolte?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/lottery?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Whilst generating a sample of Normally distributed numbers I was curious about where they ‘came from’ — particularly how a computer can create numbers that follow a distribution of choice whether that’s Normal, Exponential or something more funky. Whatever method underlies creating these Normally distributed values ([inversion sampling](https://en.wikipedia.org/wiki/Inverse_transform_sampling), [Box-Muller](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform) or the speedy [Ziggurat algorithm](https://en.wikipedia.org/wiki/Ziggurat_algorithm)) they all start with one fundamental building block: a sequence of _uniformly distributed_ values.

Which then begs the question: where do these come from? In most cases: from a ‘pseudo-random number generator’ — or PRNG. Having noticed that [NumPy changed their default PRNG back in Jul 2019](https://numpy.org/devdocs/release/1.17.0-notes.html) in response to [this NEP](https://numpy.org/neps/nep-0019-rng-policy.html) (despite the internet still littered with the old way to do it) I was keen to understand:

*   why they changed it
*   how do PRNGs work in the first place

and then write down my thoughts in plain English with some helpful charts and code examples along the way. This is these notes, heavily guided by [this](https://www.pcg-random.org/pdf/hmc-cs-2014-0905.pdf) (pretty accessible) paper and [this](https://www.youtube.com/watch?v=45Oet5qjlms&list=WL&index=171&t=364s) associated lecture by Melissa O’Neill — the author of the PCG family of PRNGs back in 2014 that now form the default PRNG in NumPy.

#### Why ‘pseudo’?

Because generating true randomness is hard — both for humans (try your luck [here](https://www.expunctis.com/2019/03/07/Not-so-random.html) and see how you fare) and also machines. If we think of machines as just taking input and producing output according to what instructions we give them then by definition the output will be as random as the input.

There are ways to make sure this input is ‘truly’ random that mostly involve hardware to measure truly random things from nature (like atmospheric noise), but usually we ‘seed’ algorithms with a chosen (non-random) initial value. Even if we use the machine time (as an integer) when the generator kicks off as the seed, this is not 100% random. However we should probably question if it is worth pursuing true randomness in the first place.

#### Do we want ‘true randomness’?

It depends on the context. If we think about randomness as the inverse of predictability, and predictability as the enemy of security, then it can be easier to answer this question. When we are using random numbers to generate keys used for security i.e. cryptography, then we want these numbers to seem as random as possible to minimise the possibility of a threat. So in this case a true random number generator is useful.

In other cases when it comes to generating simulations we might have other priorities that offset against the desire for absolute zero predictability. We might be happy with a function that whilst completely deterministic and predictable when you know the starting value (or enough of the sequence), _seems_ random when you:

*   don’t know the starting value
*   knowing ‘enough’ of the sequence is impossible in practice

Which then begs the next question:

#### What properties of PRNGs are desirable?

**Speed, size and reproducibility**

Nothing that special here — we want something that can generate a reproducible large quantity of random numbers fast and without taking up too much memory, particularly if we plan on having many of them running in various threads.

**Uniformity**

If we know that the random numbers generated will fall in the interval `[0, n]` then we'd like each number in that interval to have an equal chance of being chosen - otherwise even though _theoretically_ we have a lot of numbers to be chosen in practice this will be much smaller. As an example if we have possible numbers in the interval `[0, 255]` but in practise our PRNG selects only `3` or `250` then it's not very random at all. On the other side of things we don't necessarily want an algorithm that _guarantees_ uniformity. If this were the case then if we have a range of `n` numbers to chose from and we have already chosen `n-1` numbers, then the final number is not random at all - it will simply be the number that hasn't been selected yet. By working backwards we can see that any algorithm that guarantees uniformity will diminish in randomness as we reach the end of the range - also known as 'period'.

**A long ‘period’**

If we accept that in order to get a computer to generate a sequence we have to give it a function that converts the previous number into the next number, then if we ever end up with a number we have seen before we will start repeating the sequence. This is guaranteed to happen at some point as long as we choose numbers from a bounded interval because if we select numbers in `[0, n]` then by definition the `n+1`th number must be a repeat from a number before. In other words, over a suitable size of sequence **all PRNGs will duplicate and so become deterministic**. To prevent this we can make the number of numbers (the 'period') before this happens much much larger than the length of the sequence of numbers we wish to sample.

**Lack of pattern**

Seems like an obvious one but worth adding. For example a good algorithm to satisfy all of the above properties is simply to just ‘add 1’:

![980c78ad-01fc-4044-b4cd-120c5660cdfc.png](https://cdn-images-1.medium.com/max/800/1*FjK1rrD-CjXmu53rVnIDEg.png)

Image by author

which will be:

*   blazingly fast, small and reproducible (we just need to know `X_0` the value we started with)
*   uniform: every number in a given interval will be chosen once
*   long period: it will never repeat as long as we never ‘wrap it around’ at some value to make sure the number size doesn’t get to big i.e. map a large number, `y`, back to zero and start again

In other words the previous conditions provide the ability for a pseudo-random algorithm to _appear_ random but do not guarantee it — we still need a good algorithm that lacks predictability when you don’t know the initial condition.

This bit is key — all PRNGs will be deterministic if you know the algorithm’s ‘state’ (as in, the last random number and the function to convert that to the next random number). The key is that without that info the numbers will appear random — just like a turkey thinking that Christmas is a ‘Black Swan’ but the farmer not (randomness is relative to your information set).

#### LCGs

[Linear Congruential Generators (LCGs)](https://en.wikipedia.org/wiki/Linear_congruential_generator) are one of the oldest PRNGs and fortunately pretty simple to understand.

![8bb958be-3287-4ec3-84ec-4c7e6779f02a.png](https://cdn-images-1.medium.com/max/800/1*pta9JgL6rUIAyQUMsG1Phw.png)

In other words — to get the next number in the sequence we take the previous number and:

*   multiply it by some constant `a`
*   add some other constant `c` to it
*   take the remainder when we divide by some other constant `m`

So far, nothing too ‘computer science-y’ with scary words or phrases like ‘matrix linear recurrence’ or ‘Mersenne prime’. Let’s choose some values for `{a, c, m}` and see what the output looks like.

In particular let's form a generator in the style of a [Lehmer 1951 generator](https://en.wikipedia.org/wiki/Lehmer_random_number_generator) which is dead simple - `a=3`, `c=0` and in order to ensure we generate 8-bit numbers let's set `m=2^8=256`. This last bit just means that numbers will remain between `[0, 255]` and so fit in 8-bits.

```
3, 9, 27, 81, 243, 217, 139, 161, 227, 169, 251, 241, 211, 121, 107, 65, 195, 73, 219, 145, 179, 25, 75, 225, 163, 233, 187, 49, 147, 185, 43, 129, 131, 137, 155, 209, 115, 89, 11, 33, 99, 41, 123, 113, 83, 249, 235, 193, 67, 201, 91, 17, 51, 153, 203, 97, 35, 105, 59, 177, 19, 57, 171, 1, 3, 9, 27, 81, 243, 217, 139, 161, 227, 169, 251, 241, 211, 121, 107, 65, 195, 73, 219, 145, 179, 25, 75, 225, 163, 233, 187, 49, 147, 185, 43, 129, 131, 137, 155, 209
```

So what problems can we see already?

*   all the numbers are odd so we’re not uniformly touching all numbers at all (any observable pattern being the antithesis of randomness)
*   the period is short — you can see around half way through we get back to the start and then begin repeating ourselves

#### If LCGs are so terrible then is this relevant to PRNGs today?

Because LCGs are _not_ terrible. The above LCG _is_ terrible but that is less to do with LCGs as a family of number generators themselves and more to do with the way we parameterised that one. In fact, the following LCG is called `drand48` and is what underlies `java.util.Random`:

but has a crucial difference with the above LCG specification.

#### Don’t just output the ‘state’, but a function of it

In the first example we just generated the next number in the sequence and outputted it. If it was `255`, then the next number in our sequence was `255`. No funny business. In the above LCG implementation this is not the case - we have the following `yield seed >> 16`. In python this is a bitwise operator that shifts all the bits 16 places to the right with the right-most 16-bits getting dropped as a result.

We can take an example here — if we have the number `1017` we can represent that in binary as `11 1111 1001` (spacing just for ease of reading) - if we do `1017 >> 3` then we end up with `111 1111` (which is `127`) i.e. we shift everything to the right by 3 places and drop the first 3 bits on the right. **This is just one such type of function that illustrates a way to improve our output**. We now have the following setup for our LCG algorithm:

*   generate the next number in the sequence — this is the ‘state’ of the LCG (just terminology)
*   use that ‘state’ to generate the ‘output’ — this is the number that is then used to form part of the sequence

This is how we can have a ’16-bit generator’ with an ‘8-bit output’ — because the ‘state’ of the generator is a 16-bit number but the output is an 8-bit number where that 8-bit number is created by applying some function to the 16-bit state. As we will see, the creation of PRNGs with a different output to state can drastically improve their statistical properties.

#### Randograms: visualising randomness

In order to gain some intuition about how random various algorithms are we need a way to visualise this randomness. To do this we’ll again borrow an idea from [the paper by Melissa O’Neill](https://www.pcg-random.org/pdf/hmc-cs-2014-0905.pdf). In practise random number generators are a lot bigger than what we will do (64-bit state with 32-bit output) but the following is the idea:

*   create a generator with a state of 16-bits i.e. the seed/state is in the range`[0, 65535]` (where the upper bound is `2**16-1`)
*   output an 8-bit number that is derived from that 16-bit state — i.e. every number in the output sequence will be in `[0, 255]`
*   take the sequence and group adjacent points into pairs i.e. `[x_0, x_1], [x_2, x_3], etc`
*   these pairs form `{x, y}` co-ordinates in a 256 x 256 plot
*   use the PRNG to generate `2^16` co-ordinates and plot them where if we have no pairs for a co-ordinate then that co-ordinate is white and the more pairs we have on a given co-ordinate the more black that co-ordinate will be

In a way this will give us a nice picture of randomness. If we have a good algorithm we will have a plot with lots of dots that overall looks, well, random. This will be a lot easier to see with an example. Let’s take a well parameterised “16-bit state, 8-bit output LCG” and draw out a few ‘randograms’.

![png](https://cdn-images-1.medium.com/max/800/1*VYerLo1lEbxZmq4ex4oQtA.png)

Image by author

The top left chart shows what we get when we take the right-most 8-bits of the 16-bit state number. For example, if our ‘state’ for an iteration is the number `65413` represented in binary as `1111 1111 1000 0101`, then we will output the right-most 8 bits - `1000 0101` (or `133`). We do this for all numbers, group them as pairs and plot them.

**We can see that the numbers don’t seem very random at all — they form neat straight lines.** This is [Marsaglia’s theorem](https://en.wikipedia.org/wiki/Marsaglia%27s_theorem) and shows the issue with LCGs when we have too small a period (and so get repeating values like this). However, as we move higher up the 16-bit state things start to look a little better. There is still a clear structure in the bottom right chart, but we are doing much better in terms of covering the space.

So when looking at this we could make the following observation: **the higher the group of 8-bits in the 16-bit state number generated by a LCG, the more random they seem.**

#### Enter PCGs

Despite LCGs still finding widespread practical use, they were not the default PRNG for NumPy pre-2019. Instead, before NumPy 1.17 an algorithm called [Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister) was used — specifically MT19937 — named because of its (absolutely colossal) period length being a [Mersenne Prime](https://en.wikipedia.org/wiki/Mersenne_prime) (`2**19937 - 1` - power of 2 minus 1). However with the 1.17 NumPy release it switched over to have the default PRNG being a [PCG - _Permuted_ (Linear) Congruential Generator](https://en.wikipedia.org/wiki/Permuted_congruential_generator).

PCGs are a family of generators created by Melissa O’Neill that make clever use of the observations from the above — especially the charts. The idea is this:

*   outputting a function of the state, rather than the state directly, seems to increase randomness
*   LCGs clearly lack randomness in the lower bits (top left chart), but the higher bits tend to be ‘more random’ (bottom right chart)
*   if we have e.g. a 16-bit state outputting an 8-bit number, then we only need to choose 8 bits to output
*   why don’t we use the top few bits of the 16-bit state, which are the most random, to choose which function we apply to the remainder of the 16-bit state to generate the 8-bit output
*   in other words, let’s use the most random part of our state to randomly select a transform function to apply to the rest of the state — a randomised algorithm of sorts

Let’s have a look at a simple example.

#### PCG RS

The above 9 charts do the following: compute an 8-bit output from a 16-bit state where that 8-bits of output is generated by a pre-determined bit-shift (0 for the top left through to 8 for the bottom right). But what about instead of a _fixed_ shift, a _random_ shift?

Where do we get that randomness from? From the top few bits of our 16-bit state. In other words, if we have a state of `57277` (`1101 1111 1011 1101`) we could:

*   use the top 2 bits, `11`, to determine the shift - in this case 3
*   apply this shift to the other bits, `01 1111 1011 1101` s.t. instead of selecting the _left-most_ 8 bits, `0111 1110`, we shift along 3 to the right and select the bits `1111 0111`

In a way what we are doing when looking at the above 9 charts is using the randomness of the 8–15, 9–16 plots to randomly choose whether we select a number from the `{4-11}` - `{7-14}` plots. Let's see how this looks:

![png](https://cdn-images-1.medium.com/max/800/1*HsK8ydJKV2_5zhOVng39Vw.png)

Image by author

There’s clearly still some structure there but the improvement is huge by simply taking the top 2 bits of the 16-bit state and using this to select a permutation to the rest of the state — hence the name Permuted (Linear) Congruential Generators. But this is just one such transform — a bit shift.

What about other transforms? There are a whole host of transforms available (xor, rotation etc) that create the family of PCGs where the top bits randomly select which permutation to apply to the linearly generated state. Let’s look at 2 other such permutations that could be used.

#### Rotation

One such transform that we can (randomly) select is that of a ‘rotation’ of the bits. Just as earlier with the `>>` operator we shifted the bits to the right and dropped the overflow, with a rotation we shift one direction but then instead of dropping the overflow we bring it round the other side.

If we have the number `113`, represented in binary as `111 0001`, we can perform a 'right rotation' of `2` to create `011 1100`, or `60`. Here we have taken the 2 right-most bits (`01`) and rotated them around to the very start and shifted everything down.

#### xorshift

Another transform we could apply is that of an ‘xorshift’. Again, let’s illustrate with the same example. Again taking `113` (`111 0001`) we could:

*   ‘shift’ it down by an amount e.g. 2 to get `001 1100`
*   apply the [bitwise exclusive or](https://en.wikipedia.org/wiki/Bitwise_operation#XOR) function to the original number and the shifted number

In this case we would compute `xor` (or `^` in python) on `111 0001` and `001 1100` to get `110 1101` (1s when only 1-bit is 1, 0 if either both are 1 or 0).

#### PCG XSH-RS & PCG XSH-RR

Now let’s look at the randograms for 2 common PCGs and see how they compare to above. They are:

*   PCG XSH-RS: first compute an xorshift operation, then randomly _shift_ the resulting bits
*   PCG XSH-RR: first compute an xorshift operation, then randomly _rotate_ the resulting bits

![png](https://cdn-images-1.medium.com/max/800/1*jbzArJ5hCkX6cTO8MrLJiA.png)

Image by author

Again, there’s still structure but they are a marked improvement. This structure exists because we are using ‘small’ generators. Just as the top 8-bits are more random than the bottom 8-bits of a 16-bit state, the top 16-bits are more random than the bottom in a 32-bit state. Also as we use a bigger and bigger state we naturally increase the period. **Taking these two things together is why even very large (96-bit state, 32-bit output) LCGs can pass** [**Big Crush**](https://en.wikipedia.org/wiki/TestU01) — the extensive set of statistical tests packaged up by Pierre L’Ecuyer and Richard Simard to test PRNGs for the desirable properties mentioned earlier.

Given the added randomness of the randomly selected permutation(s), PCGs perform much better than LCGs and as a result don’t need such large states to pass the test suite. It’s for this reason that they have been adopted as the default PRNG in NumPy — with the [exact algorithm](https://numpy.org/doc/stable/reference/random/bit_generators/pcg64.html#numpy.random.PCG64) being the PCG XSL RR 128/64.
