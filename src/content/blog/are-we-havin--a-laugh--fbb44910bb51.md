---
title: "Are We Havin’ A Laugh?"
pubDate: 2021-03-03
description: "Statistically speaking, yes."
---

![](https://cdn-images-1.medium.com/max/800/1*kifpOPt4l4Wjs2DJyR3hSA.png)

_The below is a (sanitised) version of a notebook I stuck together for my friends, but thought I’d post it here for future ref. Friends’ names have been initialised to provide them some measure of ‘anonymity’ should they wish to (publicly) distance themselves. Bit of lingo: ‘Talf’ is our old shared house._

_The notebook lives_ [_here_](https://github.com/mjam03/whatsapp/blob/main/notebooks/Are%20We%20Havin%27%20A%20Laugh%3F.ipynb) _and has been published to here using the very handy library_ [_jupyter\_to\_medium_](https://github.com/dexplo/jupyter_to_medium) _for all those who despise admin as much as I do._

* * *

Ever since DB voiced his (_or her…_) thoughts on the use of ‘haha’ and its variants (last year in the kitchen in Talf I think) it’s been on my mind that potentially the group has become more generous in doling out their WhatsApp laughter — which is nice. We all like to have a laugh with our mates and what better way than to chuck a ‘haha’ back on the chat when something tickles you.

Mentioning this recently to DB, he concurred and so I decided to see if this shared feeling pans out in the data. I’ve [exported](https://faq.whatsapp.com/android/chats/how-to-save-your-chat-history/?lang=en) our diaspora of chats — now let’s get stuck in and see if we really are becoming a nicer bunch of guys.

* * *

#### Step 1: Get The Data, Parse The Data, Tabularise The Data

First things first, let’s parse those .zip files that WhatsApp exports for us and stick them in a ‘DataFrame’ (I _heart_ pandas) so we can easily analyse the ‘banter’. I’ve wrapped up the functions to parse a WhatsApp convo from a zip in [here](https://github.com/mjam03/whatsapp) to keep things neat and tidy and tidy and neat.

Now we’ve loaded in the heavies, we can use them to parse the convos and form that beautiful table of chatter.

![png](https://cdn-images-1.medium.com/max/800/1*4RyaCBhXC4pk1WcS_h4sGg.png)

We now have all our data from May-2020 onwards (when I joined Talf and subsequently them WhatsApp groups) in a nice tabular format (I still _heart_ dfs).

* * *

#### Step 2: Visualise Our Nattering

Before specifically looking for any messages that may containing ‘lolling’, let’s just have a look at what our messaging history actually looks like. How much do we chat, who’s chatting and why on earth do we maintain 4 different almost identical groups?

#### 2a. WhatsApp Activity Quite Correlated With Coronavirus Waves

First let’s get an overview of how many messages we’ve been sending in to our shared groups over the last year.

![png](https://cdn-images-1.medium.com/max/800/1*3LgXRYN6mq6gcbx-6egJ3A.png)

This one seems like a positive point. It seems like **we like to talk to each other** [**irl**](https://www.urbandictionary.com/define.php?term=irl) **more than on WhatsApp**. The big dipper in the middle of August last year is us jollying around Switzerland/Italy and the data reinforces the fact **we’re actually quite good mates who like hanging out with each other**.

Activity then picks up again heading into November as restrictions ramp up and we get ourselves through by exchanging **‘top quality banter’** on the chat. It tails off halfway through Nov as the majority of us are in the same room — **again, it seems we prefer to talk to each other irl.**

#### 2b. JB is the Glue That Binds Us

Not resting on his laurels, JB (purple) continues to contribute heavily — only being surpassed as the top contributor in 3 months:

*   2x by EM — which is a stellar effort given he is in only 3 of 4 groups included
*   1x by MJ — most notably when I was doing some aggressive thumb-twiddling in Belfast last November

![png](https://cdn-images-1.medium.com/max/800/1*uVdJsGKhsYQMNx7zOjedlQ.png)

#### 2c. Long Live the OG Group

Only a recent member, I have no claim on the long history of VOW and its previous incarnations. However, looking at the below (now that Talf is gone and we are sporadically housed) the other groups had their lockdown-induced moments in the sun, **but the OG is back.**

![png](https://cdn-images-1.medium.com/max/800/1*A5yWHUJRHKqtwrqODcgyMA.png)

Now that we’ve familiarised ourselves a bit with the _riveting_ over-arching properties of our WhatsApp chats, let’s get into the core hypothesis — **are we or are we not having a right laugh?**

* * *

#### Step 3: What About Them Haha’s?

Before we can make any statements, we first need to do a bit more work in Python.

#### 3a. Defining ‘Laughter’

First we need to qualify what text qualifies as a ‘laughter response’. To avoid creating a load of jargon, let’s reuse jargon developed in 2020 for everyone’s least favourite pandemic.

For this, there appear to be 2 main [‘variants’](https://trends.google.co.uk/trends/explore?date=all&q=variant):

*   ‘haha variant’: ‘haha’, ‘hahah’, ‘hahaha’ and even ‘aha’ and ‘ahah’
*   ‘lol variant’: ‘lol’, ‘lolol’, ‘llol’ etc

We need to construct these word lists then apply a text search function to find messages containing them. Specifically:

*   Need to avoid words where a ‘laugh variant’ is a substring of a word e.g. ‘ha’ inside ‘happen’
*   Try to minimise the search space; or we will have to search ‘n’ messages for ‘m’ substrings which can become very slow

First we define the ‘haha variant’:

```
We now have a list of 1,981 possible 'haha' words
```

Now the lol variant (being careful to remove things like ‘oll’ which appear frequently in words:

```
We now have a list of 2,019 possible 'lol' words
```

And define a function to search for these substrings in the message strings, avoiding ‘embedded laugh words’:

We can now apply this function as a lambda function to our table and generate a few columns which we can use to generate the good stuff — pretty charts.

![png](https://cdn-images-1.medium.com/max/800/1*4pZNrv4A3Wm9zNoeoVEHuQ.png)

We now have our data ready to analyse (!!!).

#### 3b. Laughter Matrices

So which words do we use the most to express a tittle? And does this change depending on whether or not the message has accompanying text?

#### 3bi. Messages only containing a ‘laugh word’ — no additional text

![png](https://cdn-images-1.medium.com/max/800/1*_uv-PmVfCCACNihipD5sCg.png)

Takeaways:

*   **The lone ‘haha’ dominates as expected**
*   FH not only leads the way in ‘solo laugh word’ responses, **but his constant struggle with spelling gives him considerable breadth in his replies**
*   In comparison, I am a complete square when it comes to laughter responses with a narrow arsenal of ‘haha’, ‘lol’ and ‘hahaha’
*   DB and EM both distribute their responses well — assessing the situation and responding with their chosen laugh word (in comparison to the ‘haha’-heavy JB)
*   **lol remains in use as a solo response despite potential exact synonymity with ‘haha’**
*   RH _provides_ banter, he doth not laugheth (although qualified by presence in only VOW)

#### 3bii. Messages with additional text

![png](https://cdn-images-1.medium.com/max/800/1*HbsAcwdTgd896kk-zBNbPQ.png)

Takeaways:

*   A much higher concentration of laugh responses, **with notably ‘ha’ entering the mix when dormant as a single word response**
*   JB surges to the top here — **he appreciates the banter, but he doth then respond as well**
*   ‘lol’ and ‘haha’ both vie for the coveted top spot, with the use of ‘lol’ in its ironic form _potentially_ bringing it to the fore

**All in this means that JB reigns supreme for providing those laughter responses.** But we already know him as the top messenger. The real question becomes, who is providing the real bang for their character-constrained buck? Who, as a % of all their messages, is doling out those haha-y responses?

#### 3biv. All messages containing a laugh word, normalised by total message count

As it doesn’t skew the picture, we’ve focussed here on only the top 5 laugh words.

![png](https://cdn-images-1.medium.com/max/800/1*kcXmFGkRgmrfGzJREDJZtQ.png)

Given JB’s consistent overall contribution, once _normalising the laughs_ he doles out by the his overall message count, this brings him back to the middle of the table. FH’s relative overall lack of activity gives him a considerable lead at the top. **And even more so than before, I remain a miserable bastard bringing up the rear.**

* * *

#### Step 4: Answer The Question — Are We Havin’ A Laugh?

Having gotten a bit carried away, it’s time to check up on the hypothesis that got us going. Time to check the trend — once we account for the overall number of messages — are we doling out more haha’s and the likes now?

![png](https://cdn-images-1.medium.com/max/800/1*0RB8jWyeZoz09pcXSQbUtQ.png)

The data sure is patchy and volatile (percentages oft more volatile than the underlying series) _but_:

*   **laughter is on the rise, buy while you still can!!!**: VOW has just surged through 10% of messages being a sole laughter response
*   something effin’ funny went down on the group CJ at the end of the year

Let’s look at the overall picture — non-message volume normalised — to help paint that serotonin-inducing picture.

![png](https://cdn-images-1.medium.com/max/800/1*sm6oj_yWsAvagaY0usLDDQ.png)

Contrasting to the overall message trends in 2a. (wave-like, similar to corona), **laughter has certainly increased in the last few months. Long may it continue.** But _who_ is driving this rise in laughter-only filled responses? Let’s dive in and look at the individual performances:

![png](https://cdn-images-1.medium.com/max/800/1*NkHKo5fq3k66wR5ws0LGYA.png)

**We all are!!!** FH experiences extreme volatility, but on the whole we are all doing our bit to make our group chats more vibey.

Finally, let’s have a look at the monthly performance of our top 5 laugh words — can any variant look to challenge ‘haha’ for the top spot?

![png](https://cdn-images-1.medium.com/max/800/1*h05Slf5vj1nzRwnIeXClnA.png)

Simply put, no. ‘haha’ reigns supreme with the best ‘hahah’ can hope for a nomination for best 2021 Newcomer, however it’s still a long way off reaching the lofty heights of 60 occurrences per month (unless we collectively become a bit funnier).

* * *

#### Step 5. Make Some Insightful Concluding Remark

**So, it appears our hypothesis _cannot_ be rejected and we do indeed seem to be being more generous with our laughter.** What a nice bunch of guys we must be becoming. However, ‘haha’ and its variants are not necessarily the sole indicator of a good time. There is no ‘haha’ without some content to generate it — **an idea to thoroughly over-analyse in another rambling essay.**

```
# df.to_csv('../data/wa_df.csv', index=False)
```
