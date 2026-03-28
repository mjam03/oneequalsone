---
title: "How to delta hedge an option: Part III"
pubDate: 2022-03-08
description: "Image by author"
---

![png](https://cdn-images-1.medium.com/max/800/1*Q6fiDBLET33VehbWY5nwhg.png)

Image by author

In [a previous article](https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-ii-519e2c120dcb) we went through the basics of what an option is, why you would buy it and built the basic foundations of what impacts its price through the argument of replication — rather than through distributional arguments requiring maths and formulae littered everywhere.

[**How to delta hedge an option: Part II**  
medium.datadriveninvestor.com](https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-ii-519e2c120dcb "https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-ii-519e2c120dcb")[](https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-ii-519e2c120dcb)

Here the aim is to continue in the same vein, but with a bit more practical stuff. The conclusion of the previous article was that through continuously re-balancing our delta hedge we can turn a call option from something that depends on where the underlying stock price finishes (‘in the money’ (ITM) vs ‘out of the money’ (OTM)) into something where what we really care about is how much the stock price _moves_ (up or down) during the life of the option — the volatility of the stock price.

But we also left a huge array of questions unanswered — most of which will probably remain unanswered here. Again in the interest of simplicity we will ignore things that complicate the picture (for now) and continue to focus on this idea of delta hedging. The aim here is to answer questions like:

*   where did we get that ‘delta’ number from — the sensitivity of the option price to the underlying stock price?
*   when we say re-balancing, how often should we do this and does it matter?
*   what if we use the wrong delta number consistently? What impacts whether this matters?

We will build a Monte Carlo engine for stock prices and then implement what we have just said — write some logic to simulate the delta hedging replication behaviour we have discussed and see if it actually works. Seeing is believing after all.

#### Monte Carlo

This is just (for me anyway) a fancy way of saying ‘simulator’. I’m sure there are more technically correct definitions but this one works for me. First things first if we want to simulate a load of _option_ prices through time then we need to simulate a load of _stock_ prices through time. To do this we will use python and in particular NumPy as we will be doing a lot with vectors.

There’s a load more info [here (more pretty graphs and intuitive explanations I promise)](https://medium.datadriveninvestor.com/why-we-use-log-returns-for-stock-returns-820cec4510ba) on why we choose to simulate stock price time series this way but if you are happy with it then we will just state the following. We will assume that stock _returns_ (not prices) come from a Normal Distribution and each return per time increment (we will base our time increments as days) is given by:

![26cc0fd0-897f-44ab-8360-364f821d43ac.png](https://cdn-images-1.medium.com/max/800/1*VxLtyAIjYvDSunRoBq1b2Q.png)

Image by author

In simple terms the ‘log return’ is given by some constant component, `r/T`, plus some random component, `epsilon`, where the random component has a scaling in front of it to decide how volatile we want our stock return process to be.

Based on the above we can see that we really have 2 ‘parameters’ to control our stock price series — the systematic return component (or ‘drift’), `r`, and the volatility of the returns given by `sigma`. Both of these numbers we will define as annual quantities and then appropriately scale them if we don't want annual returns but e.g. daily returns. The scaling nature is why we have `T` appearing in our equation.

Again, if you want to understand the nuts and bolts of this then pop over [here](https://medium.datadriveninvestor.com/why-we-use-log-returns-for-stock-returns-820cec4510ba) — I think it makes everything really clear (but I would think that because I’m the author).

[**Why we use log returns for stock returns**  
medium.datadriveninvestor.com](https://medium.datadriveninvestor.com/why-we-use-log-returns-for-stock-returns-820cec4510ba "https://medium.datadriveninvestor.com/why-we-use-log-returns-for-stock-returns-820cec4510ba")[](https://medium.datadriveninvestor.com/why-we-use-log-returns-for-stock-returns-820cec4510ba)

#### Write the python

Alright so that’s how we will define a given stock price return on a given day — now let’s build something a bit more useful for examining our delta hedging purposes. To examine the efficacy of delta hedging we would probably like:

*   lots of potential paths to illustrate what happens if we end up way ITM or OTM etc
*   each path to have multiple time points for us to re-balance our delta hedge along the way

Given that there are roughly `252` business (trading) days in a year then we will define each stock price series as an 'annual' series consisting of `252` steps (or days). We then have `252` days to re-balance our delta hedge and then compare at the end how our replication performed vs the theoretical terminal payoff - the 'hockey stick' graphs.

![png](https://cdn-images-1.medium.com/max/800/1*css9cm1cukYrIKBFYu3pFA.png)

Image by author

Okay great — the above shows a selection of the `10,000` series we have simulated with the stock price on the y-axis and the `253` days (`252` days plus `1` starting day) on the x-axis. We now have a load of underlying stock price series that we can use to:

*   value an option on at each point in time
*   compare this value to the value of our delta-hedged replication strategy
*   understand if delta-hedging is all its cracked up to be

Not to confuse things but it’s quite nice to define this stock price generation process separately. It means if we want to use a different set of assumptions to create our price simulations (e.g. log returns not normally distributed but maybe slightly more fat tailed) then we can without impacting the replication process.

#### Where is this delta number coming from?

Time to finally explain where this magic number comes from. In the previous article it was stated to just be the slope of the payoff graph of the (call) option as per below:

![png](https://cdn-images-1.medium.com/max/800/1*_qGx6LtsjtEZ24kmefIIIQ.png)

Image by author

But we never said _what_ function gives the graph it’s shape. All we did was use some logic to set some _bounds_ on how this function should look. We used logic to set bounds like:

*   it should converge to the terminal ‘hockey stick’ graph at the extremes and so have a delta of `0` way OTM and `1` way ITM
*   it should flow smoothly from these extremes
*   as time passes it should ‘decay’ toward the terminal payoff and become more kinked at the option strike `K`

But that then leaves a lot to be explained — small differences in this delta number can make huge differences in money made (‘PnL’ — profit and loss) over time for large trading desks. In order to generate this number we need a model — a model that we put in some assumptions to generate the answer to the fundamental question of what delta is:

_“What happens to the value of our option when the stock price moves?”_

This is where things can get very very complicated. In practise this is where you start to get into technical details like:

*   does it change symmetrically for an up move and a down move?
*   what sizes of moves should we use to compute the change if we use first differences to compute it? `0.5%` each way? `1%` each way?
*   are there other factors that impact the option’s price that will change when the stock price moves? If the stock price moves would we expect the ‘implied volatility’ to change as well? Can we incorporate this ‘expected’ change into our model?

For simplicity we will stick with the simple solution: **the Black-Scholes delta**. The whole argument of being able to value an option through continuous delta hedged replication is the core assumption of the Black Scholes model (along with a whole host of others). The aim here is not to get into the pros and cons of it but just to state that we will use it.

#### What is Black-Scholes?

There are honestly libraries full of this stuff but let’s stick with a bare bones explanation just to gleam the info we need for this delta-hedging simulation experiment. Black-Scholes got credit for coming up with the following option valuation formula based on the argument of continuous delta-hedged replication. The idea was that if you _continuously_ (saying this word a lot) re-balance your delta then an option can be reduced to a riskless combination of:

*   stock: the stock we hold as our delta hedge at each moment in time
*   cash: cash we may need to borrow to buy our delta hedge or generate from delta-hedging activity etc etc

**If as we saw the value of an option depends on how volatile the stock price is during its lifetime, and stock prices (and their volatilities) are very unpredictable, then how on earth can this be a _riskless_ replication?**

Great question. But the answer from the model is simple — nah, don’t worry about that; the volatility of the stock price in the model is _constant_. It’s like it’s some known factor that we input. In practise we don’t use some sort of volatility forecasting model to come up with the volatility input but instead _infer_ it from market prices — this is why it is called ‘_implied_ volatility’. Because given:

*   the other Black-Scholes formula inputs inferred from other financial instruments (interest rates from Treasury bonds, divs from div swap markets etc)
*   the option prices in the market

there is only one parameter remaining to line up to those market option prices — the volatility parameter which we can then back out from the formula.

#### The formula

Let’s just state it here and do very little explaining. This is the formula we will be using to value our options at each moment in time in each simulation:

![d4c8bddc-7c31-401e-a037-7571cc111f83.png](https://cdn-images-1.medium.com/max/800/1*ZbkYu15sei5kc0o4okRyRg.png)

Image by author

where we define:

![e7f5df88-f1d6-4a3c-bbae-6048ffbd203a.png](https://cdn-images-1.medium.com/max/800/1*HW8A6qXS8NONSA7voAvW1w.png)

Image by author

and then:

![e73df0b6-4a01-4dc3-a449-5174a8cb65c9.png](https://cdn-images-1.medium.com/max/800/1*J_L4UFAKT8sbYW993PHKGw.png)

Image by author

#### The delta

Using this formula we can then take the first derivative of it to get the sensitivity of the option price when the underlying stock price moves — the delta (nice derivation [here](https://quantpie.co.uk/bsm_formula/bs_delta.php) if you fancy it):

![b28260f1-5f93-442a-b0f0-bfc1508b9f99.png](https://cdn-images-1.medium.com/max/800/1*L3uZfjZfHjHCy7XLmMF1hw.png)

Image by author

We’re not going to get in to any explanation of this for now because it will just bog us down but if we accept it for now we can come back to it and critique it later. Again, we not stating that this is the way the world works, we’re just stating that this is _a_ version of the world and then we can test that if we create the version of the world which this model is based on (almost continuous delta re-hedging, normally distributed log returns etc) that it works.

#### Option prices

So now we have a formula for each of:

*   the option value at each moment in time
*   the delta of that option at each moment in time

let’s feed in our simulated stock prices and spit out for each price series at each moment in time these computed quantities. Once we’ve got them we can then plot a few of them vs the prices at various points throughout the year (our `252` days) and see if it lines up with what we drew out before.

![png](https://cdn-images-1.medium.com/max/800/1*pusdkATrleI-SMcM-MQIYQ.png)

Image by author

So things are looking good. We have the graph on the left showing the simulated option prices at various points in time vs the simulated stock price. The red spots show how this looks at expiry when we have zero time left. The blue dot shows that all simulated stock prices start at `100` and so they all have the same call option price, and then the other lines show us somewhere in between.

On the right hand side we then have the option delta at the same various points in time and this also lines up with what we had before — the values move smoothly from `0` to `1` except for when we have zero time left to expiry when it jumps from `0` to `1`. But this is expected and lines up with what we see in the call option price graph - we have a kink at the strike `K` that takes us from a flat line to a line with a slope of `1` when there is no time left to expiry. So far so good.

The option values (or ‘TVs’ — theoretical values) will serve as our benchmark to see if the delta-hedged replications are working and we will create these delta hedged portfolios using the deltas we have churned out to form the graph on the right.

#### Let’s get hedging

It’s quite commonly just stated “yeah you know the way to hedge an option under Black-Scholes is _just_ to hold some quantity of stock and some cash”. Sounds simple. Although in reality it’s this last bit that gets fiddly. The idea is that at each point in time we will have an option value spit out from the above formula and we want a ‘portfolio’ of:

*   stock
*   cash

s.t. we match up with this value (or maybe _on average_ match up with this value). The value of the stock is the easy bit — we just take the stock we hold (dictated to us by the delta formula above) and multiply that by the value of each of those stocks — just the current stock price `S`. The code is very very simple:

But the cash component is trickier to keep track of. If we take the example where we _sell_ a call option and so need to go about replicating it using delta hedging, our first steps are:

*   sell the option: we receive some cash for this (yay!!!)
*   buy the delta hedge: we probably haven’t received enough money from the premium to cover this so we need to borrow some cash to buy all the stock we need

But then as time progresses things get a bit trickier — after our first day out there hedging we will then have to:

*   rebalance delta hedge: this may require us to borrow more to buy more stock or sell some stock and generate some cash
*   pay interest: if we have borrowed to fund our delta hedge then we probably need to pay some interest on that — this is yet another cash flow
*   receive dividends: we will ignore this one for now but this would be yet another source of cash

and all of this needs managed through time assuming that whatever cash balance we have at each moment we are either investing and receiving the risk free rate `r` on it, or borrowing and so paying that risk free rate. Below is the implementation of this using as much NumPy as possible to prevent unnecessary loops.

Now that we should have for each simulation at each point in time:

*   a value of our delta hedge (stock portion of portfolio)
*   a value of our running cash balance

we can do what we did before — at various snapshots sum these values and see how this looks — especially in comparison to the theoretical call option value we are supposed to be replicating.

![png](https://cdn-images-1.medium.com/max/800/1*Q6fiDBLET33VehbWY5nwhg.png)

Image by author

Quite sexy. So it looks like it’s working!!! The sum of the replication components seems to line up pretty well with the theoretical option value. Sure, it’s a bit noisier than the replication (the dots are a bit scattered around) but overall it looks pretty great.

#### Recap

It’s worth reviewing what we’ve established here. Under the assumptions that we’ve imposed on our simulations (normally distributed returns, constant variance process etc etc) it looks like:

*   through holding a portfolio of just cash and the underlying stock we can replicate the payoff of a call option
*   the amount of stock we should hold is dictated to us by the delta of the Black-Scholes model
*   there is some noise in the hedging process but _on average_ it seems to line up

In [the next article](https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-iv-526cebfbc3be) let’s have a look at what happens if we look into that variation. What happens if we hedge more or less often? Why is it that sometimes we have a positive hedging error vs other times we lose money on the replication (vs the theoretical payoff)?

[**How to delta hedge an option: Part IV**  
medium.datadriveninvestor.com](https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-iv-526cebfbc3be "https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-iv-526cebfbc3be")[](https://medium.datadriveninvestor.com/how-to-delta-hedge-an-option-part-iv-526cebfbc3be)
