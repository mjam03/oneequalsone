---
title: "Deriving a Formula for the Length of a Tennis Game"
pubDate: 2022-03-03
description: "Using a points-based modelling approach to derive expected points per game"
---

![](https://cdn-images-1.medium.com/max/800/1*B7AFAFwEN3-U-dn3otEPwA.jpeg)

Photo by [Jeffery Erhunse](https://unsplash.com/@j_erhunse?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/tennis?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Before getting all excited and getting into the nitty gritty of the binomial variables and geometric series, let’s start at the start. Why? Why would we care about how to write an equation for the length of a game of tennis?

When it comes to being able to write a ‘closed form equation’ for the duration of a tennis game, the answer is probably that we _don’t_ care (outside just wanting to dust off the mathematical cobwebs). In the age of computers and simulations actually being able to solve it without numerical help that isn’t useful. But the idea of being able to relate tennis game duration to something like the probability, `p`, that the server wins any given point _is_ useful.

Tennis currently is:

*   [Apparently in a bit of a crisis](https://www.wired.co.uk/article/next-generation-atp-finals-future-of-tennis-rule-changes) with matches getting longer and instances of very long matches being more frequent.
*   Heralding a new crop of yet taller players, with taller players bringing more ferocious serves and giving yet more dominance to the serving player in any given game.

Thinking about the above two things is how I’ve ended up in my spare time mulling over this idea. The below is a walkthrough using ‘points-based modelling’ of how to derive a formula for the expected number of points in a given game of tennis, and then followed up with a bit of simulation in python to make sure I haven’t mis-stepped somewhere with all the `p`'s and `n`'s flying around.

#### Basics of points-based modelling

Given a probability `p` of the server winning a point (and thus `(1-p)` of the returner winning), we can write that the probability of the server winning `x` points if we play `n` points as:

![08e9ad69.png](https://cdn-images-1.medium.com/max/800/1*JufgM-lqONeGQDX06PueoQ.png)

Image by author

This is just a statement that the probability follows a binomial distribution as each point is considered a binary outcome (or Bernoulli random variable if you’re feeling fancy). A game of tennis can be thought of as just various collections of points with some criteria around them e.g.:

*   once one player hits 4 points then they win the game
*   if both players end up at 3 each then you need to get 2 points clear (deuce)

We can chart the structure of a game of tennis with the below:

![](https://cdn-images-1.medium.com/max/800/1*PlVccXYG0-X3FNJB49Z0qw.png)

Image by author using [https://app.diagrams.net/](https://app.diagrams.net/)

Let’s go through a few examples to explain the diagram. If the server wins every point then we follow the top diagonal — we play 4 points and with probability `p` the server wins each one. To write this down in the above format:

![79a4ae44.png](https://cdn-images-1.medium.com/max/800/1*1JzRBQZUxMn1OzzrhEEK1A.png)

Image by author

…where I have introduced the above `p(4,0)` notation for the probability that the game ends with the server winning 4 and the returner winning 0 points.

Similarly, if the server wins 4 and the returner wins 1 then we follow the diagonal up but at one point we dip down as the returner wins one point. Importantly, **this dip down cannot happen at the very end** i.e. the server wins 4 points and _then_ the returner wins their point — because in that scenario the game would already have ended. Because of this we need to remove the scenario where this happens — when the server wins 4 straight points.

This is an application of the [inclusion-exclusion principle](https://en.wikipedia.org/wiki/Inclusion%E2%80%93exclusion_principle) and will be important throughout — assuming we don’t end up in deuce, once one player has won 4 points then the game is over. Again, if you want to be fancy then you can say that we are modelling a Markov Chain where we have hit an ‘absorbing state’ — i.e. one player hits 4 points and we no longer ‘transition’ to other states because the game is over.

Using the above notation we end up with:

![345e025c.png](https://cdn-images-1.medium.com/max/800/1*PpgAj8JRSjO131TJWmwFMQ.png)

Image by author

…where the subtraction of `(4, 4)` is to remove 1 state where the server wins their 4 straight points and _then_ the returner wins theirs.

#### Turning win probabilities into game durations

In the above we have thus far focussed on _probabilities_ but what we care about here is the _duration_ of a game. In fact, we care about the _expected_ duration of a game when we have a given probability `p` of the server winning the point. To compute this we really need to sum the:

*   probability of a game ending after `x` points
*   times `x` - the number of points played

for each value of `x`. We can write this as the following equation:

![f8e09147.png](https://cdn-images-1.medium.com/max/800/1*LWpXHMx4naeOqm65NIeT2w.png)

Image by author

where we have:

*   The probability of ‘winning to love’ (either server or returner) times by 4 points
*   The probability of ‘winning to 15’ (either server or returner) times by 5 points
*   Etc. etc. etc.
*   Some ‘catch-all’ term for deuce which is more complicated because it involves some potential back and forth (will get into it later).

Given that every game has to have a minimum of 4 points we can re-write this as:

![7de4ee19.png](https://cdn-images-1.medium.com/max/800/1*PwRvJWTw4B1XAUjFuoknnA.png)

Image by author

…where `p(n)` denotes the probability of the game ending after `n` points. In the above we've just re-factored things so that instead of 'probability times points' we have 'probability times _extra_ points'—where extra is over and above the base minimum 4 points per game. We can now take these terms in turn.

#### 5 points played (1 extra point played)

As we saw above, we have a formula for the probability of a game being ‘won to 15’. All that is needed now is to sum the probabilities that the server wins to 15 with the returner winning to 15. Here we can make use of the fact that the binomial distribution is symmetric s.t.:

![9366e643.png](https://cdn-images-1.medium.com/max/800/1*1HsYwZedc_mDtBEIKD6ffw.png)

Image by author

We then have for the probability that the game ends after 5 points:

![32a14401.png](https://cdn-images-1.medium.com/max/800/1*qE2EhqyZRFNPabCthywg0A.png)

Image by author

where we have made use of the fact here of the symmetry to collapse down the binomial coefficients i.e. `(5,1) = (5,4)` and `(4,4) = (4,0)`

#### 6 points played (2 extra points played)

Very much similar to the above we can compute the probability that we play 6 points and the game ends — which we will then multiply by 2 as we are playing 2 extra points above the minimum 4 points in a tennis game:

![41455ea0.png](https://cdn-images-1.medium.com/max/800/1*VyPA2nDl5rrijKNGUriJsQ.png)

Image by author

#### Deuce

With deuce we have 2 components to calculate unlike in the previous example where we have only 1 thing to calculate — the probability of ending in that state. The 2 components are:

*   The probability of ending in that state after `n` points played (just like before).
*   The number of points played

We can take these sequentially.

#### Probability of getting to deuce

This bit is relatively simple as the probability of getting to deuce is just the probability of playing 6 points with each player winning 3 — straight from the binomial distribution:

![320af889.png](https://cdn-images-1.medium.com/max/800/1*Rn0SHafZmznND7y5GxmKqg.png)

Image by author

#### Points played in deuce

This is the hard bit. Once we hit deuce we know that the minimum we will play is 4 points _over and above_ the minimum 4 points in a game. In other words, the minimum we can play is 8 points — 6 to get to deuce, 2 if deuce is ‘resolved’ straight away. However we may play more than that if we back-and-forth a bit (going to advantage then back to deuce etc). Just as before we will need to split things out into the game ending:

*   If the server wins.
*   If the returner wins.

#### Extra points if server wins

We can state the expected extra points played if the server wins in deuce as:

![22ed40a0.png](https://cdn-images-1.medium.com/max/800/1*EXrEm6o_TJ0YnTggyD2cNg.png)

Image by author

What does this say?

*   `p(n+2,n)` is the probability that if the returner has n points, the server has 2 more points. Starting from deuce at this point the game is over because from deuce winning 2 more points is enough to win the game.
*   `[4 + 2n]` is the extra number of points e.g. if we 'resolve' deuce immediately i.e. `n=0` then we have 4 extra points.
*   We then sum over all possible `n` i.e. `n=0` is if deuce is resolved immediately, `n=1` is if we back and forth once, `n=2` is if we back and forth twice etc. etc.

We first need to get into `p(n+2, n)` - we can write this as:

![221992af.png](https://cdn-images-1.medium.com/max/800/1*p0AVDUpEBNFZ2TZjwktkiQ.png)

Image by author

To solve this we can take out everything that doesn’t depend on `j` and make use of the formula for the [sum of the binomial coefficients](https://en.wikipedia.org/wiki/Binomial_coefficient#Sums_of_binomial_coefficients):

![391a6507.png](https://cdn-images-1.medium.com/max/800/1*bZisQYr4APn0CK_QiQaF3A.png)

Image by author

This leaves us with the following equation:

![7b5b5f47.png](https://cdn-images-1.medium.com/max/800/1*Zkqvb8GUEeHYgNEimm5YRA.png)

Image by author

Substituting this into our equation above we get:

![b5ab8162.png](https://cdn-images-1.medium.com/max/800/1*1eIdLMjBFaml5lmuz6vS0A.png)

Image by author

…where we have substituted in the result from above as well as splitting the `[4+2n]` bracket out and moving the `p^2` outside of the summation as it doesn't depend on `n`. This means we now have 2 terms:

*   4 (the min extra shots played if we get to deuce) times the probability of the server winning deuce.
*   `2n` (the extra points due to back-and-forth) times the probability that deuce ends after `n` rounds of back and forth.

Looking at each of these expressions we see that they are both [geometric series](https://en.wikipedia.org/wiki/Geometric_series) but of slightly different forms. The first term is a standard geometric series of the form:

![a4cb8d2f.png](https://cdn-images-1.medium.com/max/800/1*tAru6Jllsb_xLlyF8qMBeg.png)

Image by author

…where at the end I have made the substitution that corresponds to our situation: `r=2p(1-p)`. The second series is of the form:

![538145c0.png](https://cdn-images-1.medium.com/max/800/1*szdHQYsXEjyVlR4yaQeepw.png)

Image by author

We can solve this first by noting that if we differentiate the previous ‘standard’ geometric series we get:

![4a3556b2.png](https://cdn-images-1.medium.com/max/800/1*zQagN2YqRL530mtmJad6wA.png)

Image by author

We can also differentiate the solution to this series to get:

![e87a54ca.png](https://cdn-images-1.medium.com/max/800/1*DLhCnb9UqiyhLXuZL7963w.png)

Image by author

Finally we can multiply through by `r` to get the quantity that we are interested in:

![feb840e8.png](https://cdn-images-1.medium.com/max/800/1*8VIeQ_j-01vU7h-rtEfEzA.png)

Image by author

Substituting in our situation of `r=2p(1-p)` we arrive at:

![12f4d029.png](https://cdn-images-1.medium.com/max/800/1*SzRZA7VnmWYv4cLs7RRrsQ.png)

Image by author

Now we have our building blocks we can put it all together to get the expected extra points:

*   Once we have entered deuce
*   If the server wins

![f7c6e72e.png](https://cdn-images-1.medium.com/max/800/1*AgaOGAal1vWa6LwYALaVvA.png)

Image by author

In words, this states that we add on 4 points multiplied by the probability that the server wins deuce, plus 2 extra points times the expected duration of ‘back-and-forthing’ in deuce if the server eventually wins it. Bit of a mouthful but always nice to be able to state the equation in english — even if it’s not ‘plain’ english.

#### Extra points if returner wins

We’ve done all the heavy lifting above for the server case, the returner is almost identical except that we switch around a few `p`'s for `(1-p)`'s. The expression for the extra points added for the returner is:

![839ff1df.png](https://cdn-images-1.medium.com/max/800/1*gGJuG99ONJWRJIoNwb3z_Q.png)

Image by author

#### Putting it all together

Now we have calculated all of our components, it’s time to put them together. To remind ourselves after all that derivation and substitution we have:

*   4 base points
*   the probability the game ends after 5 total points times that 1 additional point
*   the probability the game ends after 6 total points times those 2 additional points
*   the probability we enter deuce and the server wins times the extra points associated with that
*   the probability we enter deuce and the returner wins times the extra points associated with that

Now for the ugly bit:

![38ccda46.png](https://cdn-images-1.medium.com/max/800/1*ft4yx7A3w4p1Mlbw5TI5pA.png)

Image by author

#### What does our function look like graphically?

Now we have our equation, let’s:

*   Write it up in python
*   Compare the output to simulated game durations
*   Try to churn out some interesting results

The below is an implementation of the above formula in python:

So how does it look — let’s plot the output of `game_length` for various values of `p`. A bit of intuition from the above formula would state that:

*   with `p=0` or `p=1` we would expect `game_length` to output 4 - the game can only ever be won or lost to love
*   with `p` in between the expected length of the game increases as there is more potential for extra points to be played

![png](https://cdn-images-1.medium.com/max/800/1*acOexIleBZ7VMJyUhRM4eQ.png)

Image by author

So we can see that:

*   As expected at the extremes we end up with maximum 4 points played.
*   As the game becomes more balanced (`p` closer to 50%) then the expected game duration increases toward a peak of 6.75.
*   This increase in expected game duration is due to the rise in probability of the game being ‘won to 30’, but especially entering deuce which overall dominates the additional game length.

There’s quite a nice conclusion from this. If people really are worried about the length of overall tennis matches then there’s one simple suggestion — remove deuce and replace it with a ‘sudden death’ point. This in fact is something that has been trialed at the [Next Gen ATP Finals](https://en.wikipedia.org/wiki/Next_Generation_ATP_Finals) for the last 4 years.

#### Using python to check

Now let’s simulate games of tennis and see how the output of our formula compares to the distributions of game lengths that they generate. To simulate tennis games we’ll make use of the lightweight [tennisim](https://github.com/mjam03/tennisim) package that I wrote.

![png](https://cdn-images-1.medium.com/max/800/1*kDryoJirkhp7k5rIdTcebQ.png)

Image by author

The above graphs show for various values of `p` how the distribution of game lengths look when we run simulations. Specifically for the top left chart we have:

*   Simulated 100 games and recorded their mean length
*   Repeated this 1000 times
*   Plotted these values as a distribution and marked on our derived equation’s value as the vertical red line

Given that the red line seems to sit squarely in the middle of each distribution then we can say that things are looking pretty good.

#### Conclusion

As mentioned at the start, the _need_ to be able to express the length of a tennis game as a closed form equation is minimal. That point is really demonstrated by:

*   How little code is required to ‘brute force it’ and simulate millions of tennis games
*   100,000 games takes < 1 second to simulate (using `%timeit` on my mac)

Nevertheless sometimes it’s fun to see if it can be done as well as provide some useful insights as to _why_ the game is longer when it’s more balanced.

As one of the above charts shows, **the real driving factor of longer expected games is entering deuce**. The extra 4 shots that deuce adds on vs the minimum duration of `4`, along with the potential for _even more_ if you back-and-forth is what really drives the expectation higher. If there really is concern over the length of tennis matches then maybe abolishing deuce is one way of retaining the other aspects that drive match length (tiebreaks, existing set structure) whilst shortening the game — and therefore match.
