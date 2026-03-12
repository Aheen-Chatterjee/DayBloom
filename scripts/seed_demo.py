"""
DayBloom Demo Seed Script — No AI, static data only.

Creates Luna Bloom's demo account with 7 habits and 14 days of data.
Idempotent: deletes existing demo data before re-seeding.

Usage:
    SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python scripts/seed_demo.py

Or create scripts/.env with those values.
"""

import os
import sys
from datetime import date, timedelta

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print('ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars')
    sys.exit(1)

from supabase import create_client  # noqa: E402

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

DEMO_EMAIL = 'demo@daybloom.app'
DEMO_PASSWORD = 'DayBloom2025!'
DEMO_NAME = 'Luna Bloom'

# 14-day window ending yesterday
END_DATE = date.today() - timedelta(days=1)
START_DATE = END_DATE - timedelta(days=13)  # 14 days total


def dates_range(n=14):
    return [START_DATE + timedelta(days=i) for i in range(n)]


ALL_DAYS = dates_range()


# ---------------------------------------------------------------------------
# Habit definitions with completion pattern (list of 0-indexed day offsets)
# ---------------------------------------------------------------------------
HABITS = [
    {
        'name': 'Morning meditation',
        'description': 'Start the day with 10 minutes of stillness',
        'emoticon': '✿(◠‿◠)',
        'color': '#8B7355',
        'frequency': 'daily',
        'completed_days': list(range(14)),  # all 14 days
    },
    {
        'name': 'Read 20 pages',
        'description': 'Feed the mind every day',
        'emoticon': '(◕‿◕)',
        'color': '#8E6B8B',
        'frequency': 'daily',
        'completed_days': [i for i in range(14) if i not in (3, 8)],  # skip days 4, 9
    },
    {
        'name': 'Drink 8 glasses of water',
        'description': 'Stay hydrated and energized',
        'emoticon': '(ﾉ◕ヮ◕)ﾉ',
        'color': '#6B7B8E',
        'frequency': 'daily',
        'completed_days': [i for i in range(14) if i not in (5, 6, 12, 13)],  # skip weekends
    },
    {
        'name': '30 min walk',
        'description': 'Get outside and move',
        'emoticon': 'v(^_^)v',
        'color': '#6B8E6B',
        'frequency': 'daily',
        'completed_days': [i for i in range(14) if i not in (2, 7, 11)],  # 11/14
    },
    {
        'name': 'Gratitude journaling',
        'description': 'Write 3 things I am grateful for',
        'emoticon': '♡(˘▾˘)',
        'color': '#C4706A',
        'frequency': 'daily',
        'completed_days': [i for i in range(14) if i != 6],  # skip day 7
    },
    {
        'name': 'No phone 1hr before bed',
        'description': 'Wind down with intention',
        'emoticon': '(￣ω￣)',
        'color': '#7B8E6B',
        'frequency': 'daily',
        'completed_days': [0, 1, 3, 5, 7, 9, 10, 12],  # 8/14
    },
    {
        'name': 'Learn something new',
        'description': 'A chapter, a tutorial, a concept',
        'emoticon': '✧(^‿^)✧',
        'color': '#8E8B6B',
        'frequency': 'weekdays',
        'completed_days': [0, 1, 2, 4, 7, 8, 9, 11, 14],  # 9 weekdays
    },
]


JOURNAL_ENTRIES = [
    {
        'day_offset': 0,
        'title': 'A gentle beginning',
        'body': """Today felt like a true reset. I woke up before my alarm — always a good sign — and sat with my morning tea by the window while the neighborhood was still quiet. The meditation felt especially grounding today. No racing thoughts, just breath and the soft morning light.

Read the first thirty pages of *Braiding Sweetgrass* and already I can feel it changing something in me. Robin Wall Kimmerer writes about plants the way I want to write about my days: with reverence and precision.

Walked around the park for forty minutes in the afternoon. A couple of crows kept pace with me for a bit, which felt symbolic in a way I couldn't quite name. I drank all my water. I put my phone away at 9:30 and it stayed away.

**Three things I am grateful for:**
1. Morning quiet
2. A good book arriving at exactly the right time
3. The smell of rain on pavement

Feeling settled. Feeling ready.""",
    },
    {
        'day_offset': 1,
        'title': 'Momentum',
        'body': """Two days in and the habits are clicking. There is something about streaks that shifts the psychology — not the number itself but the feeling of not wanting to break a pattern you have already built.

Meditated for twelve minutes instead of ten. The extra two minutes felt like a gift to myself. Read another chapter, this time on the porch. The light was perfect.

I missed my walk — too much work in the afternoon and then it was raining heavily — but I did stretch for twenty minutes at home, which I am counting as a partial win. Water intake perfect. Phone went away at 9:15 tonight.

A colleague sent me an article about habit stacking that I found genuinely useful. Maybe I can tie the meditation directly to the water drinking so they reinforce each other.

Grateful for coffee, for momentum, and for the sound of rain on the roof.""",
    },
    {
        'day_offset': 2,
        'title': 'A harder day',
        'body': """Not every day is going to be a masterpiece, and today was proof of that. The meditation happened but it felt perfunctory — my mind kept drifting to a work problem that I could not set down. I tried to notice the thoughts without following them. Partially succeeded.

Skipped the walk entirely. Energy was low and the sky looked threatening all afternoon. I regret not going. There is a particular kind of restlessness that only a walk can resolve, and by evening I felt it like a low hum.

Still read my pages. Still drank my water. Still put the phone away early. Three out of my seven is not a great day but it is not a failure either.

**Reminder to self:** A day where you did some things is better than a day where you did none. Start again tomorrow. That is the whole practice.""",
    },
    {
        'day_offset': 3,
        'title': 'Recovery',
        'body': """After yesterday's low day, I woke up with something clarified. Not energy exactly, but intention. I meditated first thing, before coffee, before the phone, before anything — and it made a noticeable difference.

Went on a long walk in the morning while the air was still cool. Saw a heron standing very still in the creek near the bridge. Watched it for a few minutes. There is something about animals that are completely absorbed in what they are doing that I find deeply steadying.

Missed my reading goal today — I picked up the book in the evening but fell asleep after two pages. The tiredness caught up with me. But everything else was completed.

Learned about decision fatigue today from an article: the idea that choosing what to do for breakfast depletes the same finite resource as choosing what to do about a complex work situation. I want to automate more of my small decisions.

Grateful for herons, for morning walks, and for the way things feel clearer after a night of real sleep.""",
    },
    {
        'day_offset': 4,
        'title': 'Finding the rhythm',
        'body': """Something is settling. The habits are starting to feel less like tasks on a list and more like the shape of a day. I do not check whether I have meditated — I just do it, the same way I brush my teeth, the same way I make tea.

Read a wonderful chapter this evening about mycorrhizal networks: how trees share sugars through fungal threads, feeding their neighbors, passing resources to the stumps of fallen trees that are still somehow alive underground. The forest is not a collection of individuals competing for resources. It is a community.

Full checklist today. Water, walk, meditation, reading, gratitude, screen curfew. The learn-something-new habit was satisfied by the mycorrhizal reading.

**What I am grateful for:**
- The forest being more generous than I knew
- Consistent sleep this week
- My morning routine that now runs on its own""",
    },
    {
        'day_offset': 5,
        'title': 'Weekend ease',
        'body': """Saturday. I let myself sleep an extra hour and it felt earned. The meditation was longer — fifteen minutes, almost dreamlike, the kind of session where you lose track of whether you are sitting still or drifting.

Skipped the water goal today, which almost never happens. I was out most of the afternoon and just... forgot. It is easy to forget when you are away from your normal environment. Mental note to carry a water bottle on weekend outings.

The walk turned into a two-hour ramble through the botanical garden. Does a walk count if it does not feel like exercise? I am going to say yes. The dahlias are in peak bloom right now and I stopped to look at each variety. Colors I do not have names for.

Skipped the phone curfew, too. Stayed up late watching a documentary with a friend. Worth it. There is a difference between breaking a habit because you are avoiding something and breaking it because something better arrived.""",
    },
    {
        'day_offset': 6,
        'title': 'A quiet Sunday',
        'body': """Sometimes the most productive thing is to do almost nothing. That was today. I meditated, I walked, I read, I drank my water. I did not write in my gratitude journal — I simply forgot, and by the time I remembered it was close to midnight and the moment had passed.

Learned how to make a proper béchamel sauce, which I have been afraid of for years. It turned out silky and perfect on the first try. Maybe some things are only intimidating until you actually try them.

No phone after 9pm. The evening was quiet in a way that felt genuinely restorative rather than just empty.

I keep returning to that image of the heron from a few days ago. Completely still, completely present. I want more moments like that — not passive, but fully here.""",
    },
    {
        'day_offset': 7,
        'title': 'One week in',
        'body': """One full week. I am genuinely surprised by how the habits have held. I thought I would struggle more with the phone curfew and the reading, but they have both become... natural? That word does not quite capture it. Expected, maybe. The body starts to anticipate the routines.

Meditated for the full seven days. I feel different in a way I cannot measure: more patient, more present, less likely to reach for a distraction the moment discomfort arrives.

Today I learned about the Hawthorne effect: the tendency for behavior to improve when people know they are being observed. I wonder how much of my consistency this week comes from tracking it, and whether that matters. If observation leads to good behavior, does the cause of the behavior diminish its value? I do not think so. The beneficial effects on the body are real regardless of the psychology that created them.

**Grateful for:**
1. Seven days of showing up for myself
2. The way habits compound
3. Béchamel sauce, unironically""",
    },
    {
        'day_offset': 8,
        'title': 'Miss on reading',
        'body': """Today proved that even established habits need protection. I had a late meeting that stretched past 9pm, and by the time I got home I was too depleted to read. I picked up the book, read one sentence, put it down. The concentration just was not there.

Everything else held. Meditated in the morning even though I had an early start. Walked at lunch, which is becoming one of my favorite times — the city has a particular midday energy that is different from morning or evening. Drank my water, wrote my gratitude, put the phone away once I was home.

Skipped the reading but did spend twenty minutes before the meeting ended learning about retrieval-spaced learning: the idea that reviewing information at widening intervals dramatically improves long-term retention. I want to apply this to languages, to ideas, to skills.

Tomorrow the reading streak resumes.""",
    },
    {
        'day_offset': 9,
        'title': 'Back on track',
        'body': """Exactly as promised. Reading first thing in the morning, before work, with coffee. Forty pages instead of twenty. The reading streak is back.

There is something satisfying about returning to a habit after missing it, perhaps even more satisfying than never missing it at all. The break clarifies the value. When the walk is effortful, it means something. When the reading happens automatically, it is still meaningful, but different.

Meditated, walked, hydrated, read, wrote, learned (spaced repetition systems today), phone away at 9:30. A complete day.

I am starting to see the cumulative effects not just behaviorally but physically. Sleeping better. Less afternoon fog. The 8 glasses of water sounds like a small thing but the difference in how I feel is genuinely significant.

Grateful for recovery, for books that reward patience, and for the feeling of a full day well-spent.""",
    },
    {
        'day_offset': 10,
        'title': 'Deep work',
        'body': """Something clicked today about the meditation habit specifically. I had been doing it because it was on the list, because the streak would break if I did not. Today I did it because I genuinely wanted to. The shift from extrinsic to intrinsic motivation is supposed to be the goal of any habit-building practice, but I did not expect to feel it so cleanly.

Spent the evening deep in a book about deep work — the idea of protecting long blocks of uninterrupted focus for your most important tasks. I read forty-five pages without looking up. A small demonstration of the very thing the book is about.

Walk was shorter today, twenty minutes, but brisk and deliberate. Sometimes a short walk is exactly the right length.

All habits completed. The phone curfew has started to feel like a gift I give myself each evening rather than a restriction. The hour before bed has become one of my favorite times.""",
    },
    {
        'day_offset': 11,
        'title': 'Social day',
        'body': """Had friends over for dinner, which disrupted the normal rhythms in mostly good ways. Meditated in the morning before anyone arrived. The walk did not happen — I was cooking and hosting all afternoon and evening. I do not regret this. Hosting is its own kind of generous act.

Forgot my water goal completely in the busyness of the day. Two misses.

But: beautiful evening. Good food (the béchamel made another appearance). Long conversation about what we actually want from our lives, not just what we are currently doing. Those conversations are rare and necessary.

The phone curfew was naturally observed because I was too tired to reach for it by the time everyone left. Sometimes the environment does the habit work for you.

Grateful for friendship, for a table full of people I love, and for the fact that some habits are robust enough to bend without breaking.""",
    },
    {
        'day_offset': 12,
        'title': 'Two weeks',
        'body': """Fourteen days. I keep trying to articulate what has changed and the honest answer is: something has, but it is subtle. I am not a different person. The same anxieties exist. The same tendencies. But there is more space around them now, a few seconds more before reacting, a few degrees more ease when things do not go as planned.

The meditation has been the anchor. Every other habit has had its misses, its skipped days, its partial completions. The meditation has been unbroken. I am curious about what breaks it eventually, because something will, and I want to notice how I respond.

The reading has brought me into contact with so many ideas I did not have before these two weeks: mycorrhizal networks, deep work, spaced repetition, decision fatigue. Ideas that are already changing the texture of my daily thinking.

**What I have learned from two weeks of tracking:**
- Consistency matters more than perfection
- The habits that feel most optional are sometimes the most important
- A good day and a perfect day are not the same thing
- Gratitude is a practice, not a feeling you wait for

Grateful for fourteen days of trying. For this quiet corner of my life where I am honest about who I am and who I am becoming.""",
    },
    {
        'day_offset': 13,
        'title': 'Looking forward',
        'body': """The last day of this particular window, though of course it is not really a last day — it is just today, one day in a longer practice that does not have a finish line.

Full completion today. All seven habits. Not because I was trying to end the streak on a high note but because the days have genuinely come to feel like this. I wake up and the shape of the day is already there, waiting.

I want to add a new habit next week: writing for twenty minutes each morning. Not journaling exactly — I already do that — but creative writing. Fiction or essays or something without a defined form. Making space for that part of myself that does not have a practical use.

The walk today was especially beautiful. Late afternoon light, the leaves just starting to think about turning, the air with that particular crispness that comes only in this one brief window of the year.

**Final gratitude for this window:**
1. The habits themselves, for being patient teachers
2. This journal, for being a place where I can be uncertain and specific at the same time
3. Whatever comes next

(^._.^)~ Here we go.""",
    },
]


def clean_demo_user():
    """Remove existing demo user and all their data."""
    print('Cleaning up existing demo data...')

    # Find demo user by email via admin API
    try:
        users = sb.auth.admin.list_users()
        demo_user = next((u for u in users if u.email == DEMO_EMAIL), None)
        if demo_user:
            user_id = str(demo_user.id)
            print(f'  Found demo user {user_id}, deleting...')
            # Delete user (cascades to profiles, habits, journal_entries, completions via FK)
            sb.auth.admin.delete_user(user_id)
            print('  Demo user deleted.')
        else:
            print('  No existing demo user found.')
    except Exception as e:
        print(f'  Warning during cleanup: {e}')


def create_demo_user():
    """Create demo user account."""
    print('Creating demo user...')
    response = sb.auth.admin.create_user({
        'email': DEMO_EMAIL,
        'password': DEMO_PASSWORD,
        'user_metadata': {'display_name': DEMO_NAME},
        'email_confirm': True,
    })
    user_id = str(response.user.id)
    print(f'  Created user {user_id}')

    # Update profile to set is_demo = true
    sb.table('profiles').update({'display_name': DEMO_NAME, 'is_demo': True}).eq('id', user_id).execute()
    print('  Profile updated with is_demo=true')

    return user_id


def seed_habits(user_id: str) -> list[dict]:
    """Insert habits and return list with IDs."""
    print('Seeding habits...')
    created = []
    for h in HABITS:
        resp = sb.table('habits').insert({
            'user_id': user_id,
            'name': h['name'],
            'description': h['description'],
            'emoticon': h['emoticon'],
            'color': h['color'],
            'frequency': h['frequency'],
        }).execute()
        habit = resp.data[0]
        habit['_completed_days'] = h['completed_days']
        created.append(habit)
        print(f'  Created habit: {h["name"]}')
    return created


def seed_completions(user_id: str, habits: list[dict]):
    """Insert habit completions."""
    print('Seeding completions...')
    completions = []
    for habit in habits:
        for day_offset in habit['_completed_days']:
            if day_offset < 14:
                completion_date = ALL_DAYS[day_offset]
                completions.append({
                    'habit_id': habit['id'],
                    'user_id': user_id,
                    'completion_date': completion_date.isoformat(),
                })

    # Batch insert
    sb.table('habit_completions').insert(completions).execute()
    print(f'  Inserted {len(completions)} completions')


def seed_journal(user_id: str):
    """Insert static journal entries."""
    print('Seeding journal entries...')
    entries = []
    for e in JOURNAL_ENTRIES:
        day_offset = e['day_offset']
        if day_offset < 14:
            entries.append({
                'user_id': user_id,
                'entry_date': ALL_DAYS[day_offset].isoformat(),
                'title': e['title'],
                'body': e['body'].strip(),
            })

    sb.table('journal_entries').insert(entries).execute()
    print(f'  Inserted {len(entries)} journal entries')


def main():
    print('=' * 50)
    print('DayBloom Demo Seed Script')
    print(f'Seed period: {START_DATE} → {END_DATE}')
    print('=' * 50)

    clean_demo_user()
    user_id = create_demo_user()
    habits = seed_habits(user_id)
    seed_completions(user_id, habits)
    seed_journal(user_id)

    print()
    print('=' * 50)
    print('Seed complete! ✿')
    print(f'Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}')
    print('=' * 50)


if __name__ == '__main__':
    main()
