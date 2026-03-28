---
title: "Building A Tennis Match Simulator in Python"
pubDate: 2021-11-16
description: "Using Python to verify the math behind points-based modelling of tennis games"
---

![](https://cdn-images-1.medium.com/max/800/1*mXaD92ySYGZQ0x-6I9P76Q.jpeg)

Photo by [Moises Alex](https://unsplash.com/@arnok?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/tennis?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Tennis, like other racket sports (and volleyball), has a specific scoring system that involves point scoring being divided up into subsets with these chunks being what matters to the overall match, not each individual point. This leads to the natural question:

_“What’s the relationship between the probability of winning a given point and the probability of winning a game/set/match of tennis?”_

Hopefully positive, otherwise skill would not be rewarded. The following are my notes on how to model a game of tennis using a “points-based model” as part of building a tennis match simulator in order to answer some interesting questions around the impact of changing various rules of the game (like abolishing the second serve or reducing deuce to sudden death).

The aim is to:

*   run through the idea of a points-based model
*   derive an equation for the probability of the server winning a game
*   test this derivation using simulations in python from a module `tennisim`

#### Just one variable, p

To keep things simple we will assume that a point can be fully described by just one variable, `p`: the probability that the server wins a given point in the game. The assumptions then around this are:

*   this probability can be estimated with reasonable accuracy _before_ the game is played
*   this probability is constant throughout the game
*   each point is independent: the result of the previous point (or collection of previous points) does not impact the probability for this point

#### How to score a game of tennis

What makes tennis interesting is that not every point matters the same. The match is not simply a race to around 150 points each where the Law of Large Numbers (LLN) would start to kick in and as a result there would be few upsets.

Instead, points are sub-divided into games with each game one player given an advantage — they get to start the point by slamming in the first shot as they please.

#### Basics of points-based modelling

It’s called points-based modelling because in order to get the result of games, sets and matches we rely on computing the outcome of all the constituent points. Even though this may not be the most predictive model for modelling the overall outcome of matches (which seems to be a modified version of ELO), it is hugely useful because of the wealth of intra-match information it churns out and so provides the basis for making “in-play odds”.

Given:

*   `p`: the probability that the server wins the point
*   `(1-p)`: the probability that the returner wins the point (given no one else can win the point)

we can then generate the following ‘flow chart’ of how a game of tennis progresses:

![](https://cdn-images-1.medium.com/max/800/1*PlVccXYG0-X3FNJB49Z0qw.png)

Image by author using [https://app.diagrams.net/](https://app.diagrams.net/)

So to briefly describe the above:

*   we start at 0–0
*   with probability `p` the server wins the point and we move 'up' on the chart
*   vice versa with probability `(1-p)` - we move 'down' the chart
*   we have some kind of looping behaviour at the end if we get to deuce where if one player doesn’t win 2 points in a row then we bounce back to deuce (which is the same as 30–30 because at that point both players need to win 2 points in a row to finish off the game)

We can use this diagram to display the intuition for how to model the game in the form of an equation. For example, we can see that there is only one way to win a game to love: win 4 points in a row. If you are the server then the probability of this happening is (`p x p x p x p`). The reverse is true for the returner to break the serve to love with all other possible routes to a game ending being described by the paths down the middle of the diagram.

For each possible end result of a game to get the probability of it happening we need to:

*   calculate the probability of a game ending with a certain score e.g. won to love
*   multiply that by the number of ways that that _final_ score can be reached e.g. just 1 for to love

For example there are multiple ways that a game can end where the server wins and the returner had 15 when the game ended because the returner could have won that point at different instances throughout the game. Given that we are treating each point as a [Bernoulli variable](https://en.wikipedia.org/wiki/Bernoulli_distribution) i.e. there are only two mutually exclusive outcomes — then we can treat a collection of points as a [Binomial variable](https://en.wikipedia.org/wiki/Binomial_distribution) that follows a Binomial distribution.

We can then write the following — the probability, `P`, that if we play `n` points the server will win `x` of them is:

![c5f95e3a-a0af-4627-a78a-19cd6b4755cc.png](https://cdn-images-1.medium.com/max/800/1*a09P3vOtEk9gW7QmsYUWiQ.png)

Image by author

where we also define the [‘Binomial coefficient’](https://en.wikipedia.org/wiki/Binomial_coefficient):

![8b8a4050-946e-4e29-91f8-9f58348187bb.png](https://cdn-images-1.medium.com/max/800/1*5WzWtQEYdP3aaz0hBYyXfA.png)

Image by author

#### Writing out the equation for a given game

The final thing we need to be careful about is **not to double count outcomes** — this is best illustrated by an example. For the server to win a game to ‘15’ they need to win 4 points and their opponent wins 1. In the above example that would be playing `n=5` points with the server winning `x=4`. The above equation (for the binomial coefficient) would tell us there are 5 ways this can happen. However this isn't quite true because it is counting the outcome where the server wins the first 4 points and the returner wins the last point - but this would not be possible because the game would already be over (the server would have won to love).

To circumvent this, we can apply the [inclusion-exclusion principle](https://en.wikipedia.org/wiki/Inclusion%E2%80%93exclusion_principle) — to get the number of ways the above can happen we need to subtract the number of ways in which the server can win to love.

Now, let’s write down the following as the probability of the server winning a game:

![4d43c3af.png](https://cdn-images-1.medium.com/max/800/1*yucl2OTZYdcLMloTxKNC2g.png)

Image by author

In words, the probability of the server winning the game is the sum of:

*   the probability they win to love
*   the probability they win to 15
*   the probability they win to 30
*   the probability that they enter ‘deuce’ and then manage to (at some point) win 2 consecutive points

Before diving into the last bit we can solve the first few bits as they are simpler.

![0a970e6f.png](https://cdn-images-1.medium.com/max/800/1*xyttMQfXV4joPu2hiiM_tg.png)

Image by author

Now we can separate the last bit out into:

*   the probability that when we play 6 points each player wins 3 (easy)
*   the probability that eventually the server will manage to win 2 straight points (hard)

The first bit can be written simply as:

![49f42335.png](https://cdn-images-1.medium.com/max/800/1*9PZ7lFD-LGLoxiEayxN_lA.png)

Image by author

where we don’t need to worry about double counting here because no one is scoring 4 points (yet) and so the game cannot have ended. Now the tricky bit — let’s first work out the probability for any `n` that the server has won `n+2` points. We can think about this as the sum of:

*   the server wins 2 points straight away (from deuce)
*   the server wins 1, then returner wins 1, then server wins 2 to win
*   the returner wins 1, then server wins 1, then server wins 2 to win
*   server wins, returner wins, server wins, returner wins, server wins 2 to win
*   etc. etc. etc.

We can express this mathematically as:

![6950d6eb.png](https://cdn-images-1.medium.com/max/800/1*LwWzMa0d55biJWtgVV3jbA.png)

Image by author

where:

*   `p(1-p)` is the outcome of server wins point, then returner
*   `(1-p)p` is the outcome of returner wins point, then server
*   `p^2` is then the server winning the next 2 points

We can then simplify this to:

![71ab204d.png](https://cdn-images-1.medium.com/max/800/1*poTuiSmGuHpo2THIpJDk_w.png)

Image by author

where we have taken everything that doesn’t depend on `j` outside of the summation. What's left is the [sum of the binomial coefficients](https://en.wikipedia.org/wiki/Binomial_coefficient#Sums_of_binomial_coefficients) which is:

![0318fddf.png](https://cdn-images-1.medium.com/max/800/1*na8_Twpbd4aOsPNOaq1ibg.png)

Image by author

Now we substitute this into our original expression to get:

![bd9c6dfe.png](https://cdn-images-1.medium.com/max/800/1*Y-dQZolLxtwpH-2g2pR0gw.png)

Image by author

Finally, taking the `p^2` outside of the brackets and then summing the [infinite geometric series](https://en.wikipedia.org/wiki/Geometric_progression#Infinite_geometric_series) we arrive at the final piece of our puzzle:

![4bfd9afb.png](https://cdn-images-1.medium.com/max/800/1*qZWCvfy0keXBLPQr9M-x0w.png)

Image by author

Plugging this altogether with the above we get the following expression for the probability of a server winning a game just in terms of their probability of winning a point on serve:

![56a79c29.png](https://cdn-images-1.medium.com/max/800/1*_8Fay6SsLK1sG5q0r53dRw.png)

Image by author

#### Using simulations to check

Now we have:

*   a closed form solution
*   python at our disposal

we might as well run some simulations to verify that what we expect as the probability that the server wins a game, given the probability that they will win any given point, corresponds to what we see as the mean when we simulate.

I’ve packaged the following up as `tennisim` which is available on PyPI simply by using `pip install tennisim`, but for the sake of completeness the following is the code from `tennisim` to simulate a game along with some imports for charting:

We can first have a look at how the probability of the server winning a game varies with the probability that the server wins any given point:

![png](https://cdn-images-1.medium.com/max/800/1*GmTswJb-90zjgXQGsoHFHA.png)

Image by author

Now let’s check if our equation lines up with the data if we simulate games of tennis. We will:

*   simulate 1,000 groups of 100 games at various probabilities that the server will win a given point
*   compare the distributions of these groups to the expected probability computed using our derived equation above

![png](https://cdn-images-1.medium.com/max/800/1*xyiA-3Iag4EyOay8pLZGJw.png)

Image by author

So it looks like the simulations are backing up the derivation — each distribution of simulations is centred around the theoretical probability of winning (the red line).

It’s also interesting to note, as the previous line graph showed that the probability of winning the game increases by more than 1% for every % increase in the probability of the server winning a point. This is only true in a specific range of the above chart, but given that most professional players sit around 60–80% it shows just how important improving your serve can be as it increases more than linearly the chance that you’ll hold your service game.

#### Conclusion

Once we assume that a tennis game can be reduced to a series of independent points with a fixed probability that the server will win each of them, we have shown that the probability of a server winning a game can be described in closed form. Verifying this with a series of simulations shows how useful it can be to simulate simple probabilistic settings with simulations being able to be used in following articles to:

*   investigate the effect of changing `p` on the expected length (in points) of games
*   investigate the effect of changing `p` on the expected distribution of set scores (6–4, 7–5, 6–2 etc)
