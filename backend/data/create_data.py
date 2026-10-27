import json
import random
from datetime import datetime, timedelta
import pandas as pd

# Curated catalog of 20 rich games for recommendation & NER
GAMES_CATALOG = [
    {
        "id": "game-1",
        "title": "Valorant",
        "developer": "Riot Games",
        "genres": ["Tactical Shooter", "FPS", "Competitive Multiplayer", "Esports"],
        "description": "A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities. Highly competitive with tactical team coordination, map control, and ranked climb.",
        "tags": ["fps", "tactical", "multiplayer", "ranked", "shooter", "hero shooter", "clutch", "esports"],
        "rating": 4.5,
        "release_year": 2020
    },
    {
        "id": "game-2",
        "title": "Elden Ring",
        "developer": "FromSoftware",
        "genres": ["Action RPG", "Open World", "Souls-like", "Dark Fantasy"],
        "description": "An expansive dark fantasy action-RPG featuring vast landscapes, challenging boss fights, intricate dungeon crawling, build variety, and atmospheric storytelling crafted with George R.R. Martin.",
        "tags": ["rpg", "open world", "souls-like", "difficult", "fantasy", "boss fight", "exploration", "lore"],
        "rating": 4.9,
        "release_year": 2022
    },
    {
        "id": "game-3",
        "title": "Cyberpunk 2077",
        "developer": "CD Projekt Red",
        "genres": ["Action RPG", "Open World", "Sci-Fi", "Cyberpunk"],
        "description": "An open-world narrative action adventure set in Night City, a megalopolis obsessed with power, glamour, and body modification. Features deep questlines, ray tracing graphics, and cyberware builds.",
        "tags": ["cyberpunk", "sci-fi", "open world", "story rich", "rpg", "fps", "futuristic", "night city"],
        "rating": 4.6,
        "release_year": 2020
    },
    {
        "id": "game-4",
        "title": "Baldurs Gate 3",
        "developer": "Larian Studios",
        "genres": ["CRPG", "Turn-Based", "Dungeons & Dragons", "Story Rich"],
        "description": "A story-rich, party-based RPG set in the universe of Dungeons & Dragons, where your choices shape a tale of fellowship, betrayal, sacrifice, and the lure of absolute power.",
        "tags": ["crpg", "turn-based", "dnd", "story rich", "choices matter", "fantasy", "co-op", "tactical"],
        "rating": 4.9,
        "release_year": 2023
    },
    {
        "id": "game-5",
        "title": "Hades II",
        "developer": "Supergiant Games",
        "genres": ["Roguelike", "Action RPG", "Hack and Slash", "Indie"],
        "description": "Battle beyond the Underworld using dark sorcery to take on the Titan of Time in this bewitching rogue-like dungeon crawler with rich Olympian storytelling and fast-paced combat.",
        "tags": ["roguelike", "indie", "fast-paced", "mythology", "action", "hack and slash", "soundtrack", "dungeon crawler"],
        "rating": 4.8,
        "release_year": 2024
    },
    {
        "id": "game-6",
        "title": "Hollow Knight",
        "developer": "Team Cherry",
        "genres": ["Metroidvania", "Souls-like", "2D Platformer", "Indie"],
        "description": "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Traditional 2D animation, tight platforming, and deep exploration.",
        "tags": ["metroidvania", "indie", "difficult", "atmospheric", "2d", "platformer", "exploration", "lore"],
        "rating": 4.9,
        "release_year": 2017
    },
    {
        "id": "game-7",
        "title": "Apex Legends",
        "developer": "Respawn Entertainment",
        "genres": ["Battle Royale", "FPS", "Movement Shooter", "Hero Shooter"],
        "description": "Conquer with character in Apex Legends, a free-to-play Hero shooter where legendary characters with powerful abilities team up to battle for fame & fortune on the fringes of the Frontier.",
        "tags": ["battle royale", "fps", "fast movement", "hero shooter", "teamwork", "multiplayer", "ranked"],
        "rating": 4.3,
        "release_year": 2019
    },
    {
        "id": "game-8",
        "title": "Overwatch 2",
        "developer": "Blizzard Entertainment",
        "genres": ["Hero Shooter", "Team FPS", "Esports", "Action"],
        "description": "An always-on and free-to-play team-based action game set in an optimistic future, where every match is the ultimate 5v5 battlefield brawl with unique heroes.",
        "tags": ["hero shooter", "team-based", "multiplayer", "fps", "competitive", "esports", "abilities"],
        "rating": 3.9,
        "release_year": 2022
    },
    {
        "id": "game-9",
        "title": "Minecraft",
        "developer": "Mojang Studios",
        "genres": ["Sandbox", "Survival", "Adventure", "Building"],
        "description": "Explore infinite worlds and build everything from the simplest of homes to the grandest of castles in creative or survival mode with redstone automation and community mods.",
        "tags": ["sandbox", "survival", "crafting", "building", "multiplayer", "relaxing", "open world", "creative"],
        "rating": 4.8,
        "release_year": 2011
    },
    {
        "id": "game-10",
        "title": "Genshin Impact",
        "developer": "miHoYo",
        "genres": ["Action RPG", "Open World", "Gacha", "Anime"],
        "description": "Embark on a journey across Teyvat to seek answers from The Seven. Explore the wondrous world, join forces with diverse characters, and unravel mysteries with elemental magic combat.",
        "tags": ["open world", "anime", "action rpg", "gacha", "elemental combat", "exploration", "story rich"],
        "rating": 4.4,
        "release_year": 2020
    },
    {
        "id": "game-11",
        "title": "Helldivers 2",
        "developer": "Arrowhead Game Studios",
        "genres": ["Co-op Shooter", "Third-Person Shooter", "Sci-Fi", "PvE"],
        "description": "Join the Helldivers and fight for freedom across a hostile galaxy in a fast, frantic, and ferocious third-person co-op team shooter against Terminid swarms and Automaton legions.",
        "tags": ["co-op", "pve", "shooter", "sci-fi", "tactical", "friendly fire", "action", "chaotic"],
        "rating": 4.7,
        "release_year": 2024
    },
    {
        "id": "game-12",
        "title": "Stardew Valley",
        "developer": "ConcernedApe",
        "genres": ["Farming Sim", "RPG", "Life Sim", "Indie"],
        "description": "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, set out to begin your new cozy life and revive the town.",
        "tags": ["cozy", "farming", "life sim", "relaxing", "indie", "pixel art", "crafting", "multiplayer"],
        "rating": 4.9,
        "release_year": 2016
    },
    {
        "id": "game-13",
        "title": "Counter-Strike 2",
        "developer": "Valve",
        "genres": ["Tactical Shooter", "FPS", "Esports", "Competitive"],
        "description": "For over two decades, Counter-Strike has offered an elite competitive experience. CS2 delivers the largest technical leap forward in CS history with sub-tick updates and volumetric smokes.",
        "tags": ["tactical", "fps", "competitive", "esports", "multiplayer", "economy", "aim", "ranked"],
        "rating": 4.2,
        "release_year": 2023
    },
    {
        "id": "game-14",
        "title": "Lethal Company",
        "developer": "Zeekerss",
        "genres": ["Survival Horror", "Co-op", "Indie", "Comedy Horror"],
        "description": "You are a contracted worker for the Company. Your job is to collect scrap from abandoned, industrialized moons to meet the Company's profit quota while surviving deadly monsters.",
        "tags": ["co-op", "horror", "funny", "proximity voice", "indie", "survival horror", "monsters"],
        "rating": 4.7,
        "release_year": 2023
    },
    {
        "id": "game-15",
        "title": "The Witcher 3: Wild Hunt",
        "developer": "CD Projekt Red",
        "genres": ["Action RPG", "Open World", "Dark Fantasy", "Story Rich"],
        "description": "As war rages across the Northern Realms, take on the greatest contract of your life — tracking down Ciri, the Child of Prophecy, a living weapon that can alter the shape of the world.",
        "tags": ["open world", "rpg", "story rich", "fantasy", "sword fighting", "monsters", "masterpiece"],
        "rating": 4.9,
        "release_year": 2015
    },
    {
        "id": "game-16",
        "title": "Sea of Thieves",
        "developer": "Rare",
        "genres": ["Action Adventure", "Pirate", "Multiplayer", "Open World"],
        "description": "Sea of Thieves offers the essential pirate experience, from sailing and fighting to exploring and looting — everything you need to live the pirate life and become a legend.",
        "tags": ["pirates", "multiplayer", "co-op", "pvpve", "sailing", "adventure", "open world"],
        "rating": 4.4,
        "release_year": 2018
    },
    {
        "id": "game-17",
        "title": "Celeste",
        "developer": "Maddy Makes Games",
        "genres": ["Platformer", "Indie", "Precision Platformer", "Story Rich"],
        "description": "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain in this super-tight, hand-crafted precision platformer from the creators of TowerFall.",
        "tags": ["indie", "precision platformer", "difficult", "great soundtrack", "emotional", "2d", "story"],
        "rating": 4.9,
        "release_year": 2018
    },
    {
        "id": "game-18",
        "title": "Monster Hunter: World",
        "developer": "Capcom",
        "genres": ["Action RPG", "Co-op", "Hunting", "Boss Fight"],
        "description": "Welcome to a new world! Take on the role of a hunter and slay ferocious monsters in a living, breathing ecosystem where you can use the landscape and its diverse inhabitants to get the upper hand.",
        "tags": ["hunting", "action rpg", "co-op", "monsters", "crafting", "boss fights", "weapons"],
        "rating": 4.6,
        "release_year": 2018
    },
    {
        "id": "game-19",
        "title": "Rocket League",
        "developer": "Psyonix",
        "genres": ["Sports", "Vehicular Soccer", "Competitive", "Esports"],
        "description": "Soccer meets driving once again in the physics-based multiplayer vehicular mayhem hit. Take to the pitch for a fully-featured offline season mode, multiple game types, and intense ranked play.",
        "tags": ["sports", "cars", "competitive", "physics", "multiplayer", "fast-paced", "ranked"],
        "rating": 4.5,
        "release_year": 2015
    },
    {
        "id": "game-20",
        "title": "Palworld",
        "developer": "Pocketpair",
        "genres": ["Survival", "Open World", "Creature Collector", "Crafting"],
        "description": "Fight, farm, build and work alongside mysterious creatures called Pals in this completely new multiplayer, open-world survival and crafting game.",
        "tags": ["creature collector", "survival", "crafting", "open world", "multiplayer", "building", "action"],
        "rating": 4.3,
        "release_year": 2024
    }
]

# Write catalog JSON
with open("C:/Users/kpgam/.gemini/antigravity/scratch/discord-text-web-analysis/backend/data/games_catalog.json", "w") as f:
    json.dump(GAMES_CATALOG, f, indent=2)

print("Saved games_catalog.json")

# Define users
USERS = [
    "user_shadow_99",
    "user_pixel_fox",
    "user_cyber_knight",
    "user_glitch_queen",
    "user_neon_samurai",
    "user_vortex_gamer",
    "user_zero_ping",
    "user_echo_strike",
    "user_mystic_coder",
    "user_astra_nova",
    "user_frost_byte",
    "user_hyper_nova",
    "user_blaze_runner",
    "user_chrono_trigger",
    "user_phantom_blade"
]

CHANNELS = [
    "#general",
    "#valorant-lfg",
    "#rpg-tavern",
    "#indie-games",
    "#game-dev",
    "#esports-hype"
]

# Authentic discord messages generator templates
SEED_MESSAGES = [
    # Valorant & FPS
    ("Yo @user_pixel_fox are we 5-stacking Valorant competitive tonight? I finally reached Ascendant 2! 🔥", "positive", "Valorant", "#valorant-lfg"),
    ("That last clutch on Ascent was insane! Jett diff completely carried us gg wp", "positive", "Valorant", "#valorant-lfg"),
    ("Honestly Riot Games ruined the flash meta in the latest patch, Iso shield is so broken it makes ranked unplayable", "negative", "Valorant", "#valorant-lfg"),
    ("The server tickrate feels terrible today. Lost 25 RR because of packet loss and high ping in Seattle server.", "negative", "Valorant", "#valorant-lfg"),
    ("Anyone know what crosshair tenz is using right now? Looks like cyan dot 1-2-1", "neutral", "Valorant", "#valorant-lfg"),
    ("Counter-Strike 2 sub-tick is getting better, but Valve still needs to fix the anti-cheat asap.", "neutral", "Counter-Strike 2", "#esports-hype"),
    ("CS2 premier rating climb is so satisfying when your teammates actually use comms and smokes!", "positive", "Counter-Strike 2", "#esports-hype"),
    ("Overwatch 2 balance team has no idea what they are doing. Sombra hack is ridiculously anti-fun.", "negative", "Overwatch 2", "#esports-hype"),
    ("Apex Legends movement tech is unmatched. Superglide into tap-strafe feels so clean when you nail it.", "positive", "Apex Legends", "#esports-hype"),
    ("Can we talk about the esports grand finals in Tokyo? Faker and T1 played out of this world!", "positive", "Valorant", "#esports-hype"),

    # RPG & Souls
    ("Elden Ring Shadow of the Erdtree DLC is an absolute masterpiece. Miyazaki delivered the greatest boss design ever.", "positive", "Elden Ring", "#rpg-tavern"),
    ("Bro Promised Consort Radahn is genuinely unfair. Frame drops on phase 2 holy light attacks are crazy bad.", "negative", "Elden Ring", "#rpg-tavern"),
    ("What build are you running for Malenia? Bleed build with Rivers of Blood or pure strength colossal sword?", "neutral", "Elden Ring", "#rpg-tavern"),
    ("Baldurs Gate 3 Act 3 performance is super smooth after patch 7. Larian Studios set the standard for modern RPGs.", "positive", "Baldurs Gate 3", "#rpg-tavern"),
    ("I spent 4 hours in Baldurs Gate 3 character creator just tweaking my tiefling bard stats lol", "neutral", "Baldurs Gate 3", "#rpg-tavern"),
    ("The dialogue options in BG3 are so deep! Your choices actually carry huge consequences in Act 2.", "positive", "Baldurs Gate 3", "#rpg-tavern"),
    ("Cyberpunk 2077 in Night City with path tracing on RTX 4080 looks unbelievably photorealistic. Love Phantom Liberty!", "positive", "Cyberpunk 2077", "#rpg-tavern"),
    ("Still remember the Cyberpunk 2077 launch disaster back in 2020. CD Projekt Red really had to work hard to redeem it.", "neutral", "Cyberpunk 2077", "#rpg-tavern"),
    ("The Witcher 3 next-gen update is gorgeous. Traveling through Skellige with that violin soundtrack is pure peace.", "positive", "The Witcher 3: Wild Hunt", "#rpg-tavern"),
    ("Genshin Impact 5.0 Natlan region exploration is fun, but the 50/50 gacha rates are totally predatory and predatory.", "negative", "Genshin Impact", "#rpg-tavern"),

    # Indie & Roguelikes
    ("Hades II Melinoe combat feels even tighter than Zagreus in Hades 1! Supergiant Games music is a 10/10.", "positive", "Hades II", "#indie-games"),
    ("Hollow Knight Silksong when? Team Cherry has been silent for years, the copium in this server is unreal 😂", "neutral", "Hollow Knight", "#indie-games"),
    ("Path of Pain in Hollow Knight broke my keyboard. Toughest platforming challenge ever designed.", "negative", "Hollow Knight", "#indie-games"),
    ("Celeste Farewell chapter is one of the most emotional and punishing platformers I have ever completed. 10/10.", "positive", "Celeste", "#indie-games"),
    ("Stardew Valley 1.6 update added so much free content! ConcernedApe is the most dedicated solo indie dev in history.", "positive", "Stardew Valley", "#indie-games"),
    ("Lethal Company with proximity chat is the funniest co-op horror experience I have had in years.", "positive", "Lethal Company", "#indie-games"),
    ("We lost all our scrap to a Jester on Titan moon in Lethal Company, complete squad wipeout smh", "negative", "Lethal Company", "#indie-games"),

    # Co-op, Survival & Sandbox
    ("Helldivers 2 spreading managed democracy for Super Earth! Malevelon Creek was pure Vietnam in space haha", "positive", "Helldivers 2", "#general"),
    ("Sony requiring PSN account linking on PC for Helldivers 2 was such a greedy decision. Community review-bomb was deserved.", "negative", "Helldivers 2", "#general"),
    ("Minecraft new autocrafter redstone block changes everything. Technical survival farms are going to be legendary.", "positive", "Minecraft", "#general"),
    ("My Minecraft hardmode world got deleted because of a creeper explosion behind me. Devastated rn.", "negative", "Minecraft", "#general"),
    ("Palworld base building is super addictive. Automated ore mining with Anubis makes late game so fast.", "positive", "Palworld", "#general"),
    ("Sea of Thieves skull fort battle turned into a 3-hour galleon naval war. Best pirate experience ever!", "positive", "Sea of Thieves", "#general"),
    ("Monster Hunter Wilds trailer looked unreal at Summer Game Fest in Los Angeles! Great sword focus strike looks juicy.", "positive", "Monster Hunter: World", "#general"),
    ("Rocket League ranking reset placed me in Diamond 1 again. Smurfs in 2v2 are ruining the fun.", "negative", "Rocket League", "#general"),

    # Tech, Game Dev, General Server Banter
    ("Working on Godot 4 shaders for my indie project. GDScript is so much more enjoyable than Unity C# right now.", "positive", None, "#game-dev"),
    ("Unity runtime fee drama last year made everyone migrate to Unreal Engine 5 and Godot. Best decision ever.", "neutral", None, "#game-dev"),
    ("Python FastAPI and React makes building full-stack dashboards so fast and clean! Loving this tech stack.", "positive", None, "#game-dev"),
    ("Git merge conflict on the main branch just nuked our sprint progress. Someone please review PR #42 @user_mystic_coder", "negative", None, "#game-dev"),
    ("Anyone testing local LLMs with Ollama on RTX GPUs? Inference speed is surprisingly quick.", "neutral", None, "#game-dev"),
    ("Welcome new members! Check out #rules and grab roles for game notifications. Good vibes only!", "positive", None, "#general"),
    ("Why is Discord mobile app update so laggy? The new layout is so confusing to navigate.", "negative", None, "#general"),
    ("Server movie night this Friday 8 PM EST in voice channel! Voting between Matrix and Cyberpunk Edgerunners.", "neutral", None, "#general"),
    ("Shoutout to our server moderators for cleaning up spam bots so quickly. Appreciate you all!", "positive", None, "#general"),
    ("Did anyone catch the shroud stream today? His aim in Deadlock is freakish.", "neutral", None, "#general")
]

# Generate 200 records over 28 days (Baseline period: 28 to 14 days ago; Recent period: 13 to 0 days ago)
random.seed(42)
start_date = datetime.now() - timedelta(days=28)

records = []
message_id_counter = 1001

for i in range(200):
    msg_id = f"DIS-{message_id_counter}"
    message_id_counter += 1
    
    # Pick template or variation
    template = random.choice(SEED_MESSAGES)
    text = template[0]
    sentiment = template[1]
    game = template[2]
    channel = template[3]
    
    # User selection (power users appear more often)
    user = random.choices(
        USERS,
        weights=[20, 18, 15, 12, 10, 8, 8, 7, 6, 6, 5, 4, 4, 3, 3],
        k=1
    )[0]
    
    # Timestamps spread over 28 days, peaking on weekends and evenings
    day_offset = random.uniform(0, 28)
    msg_time = start_date + timedelta(days=day_offset)
    timestamp_str = msg_time.strftime("%Y-%m-%d %H:%M:%S")
    
    # Reply-to linking to create realistic conversation tree
    reply_to = ""
    if len(records) > 3 and random.random() < 0.45:
        # Pick a prior message, preferably in same channel
        prior_candidates = [r for r in records if r["channel"] == channel]
        if prior_candidates:
            target = random.choice(prior_candidates[-10:])
            reply_to = target["message_id"]
            # occasionally add mention
            if random.random() < 0.6 and f"@{target['user_id']}" not in text:
                text = f"@{target['user_id']} {text}"
    
    records.append({
        "message_id": msg_id,
        "timestamp": timestamp_str,
        "user_id": user,
        "channel": channel,
        "message": text,
        "reply_to": reply_to,
        "game_title": game if game else "",
        "sentiment_label": sentiment,
        "source": "synthetic_demo"
    })

# Convert to DataFrame and sort by timestamp
df = pd.DataFrame(records)
df["timestamp"] = pd.to_datetime(df["timestamp"])
df = df.sort_values("timestamp").reset_index(drop=True)
df["timestamp"] = df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

csv_path = "C:/Users/kpgam/.gemini/antigravity/scratch/discord-text-web-analysis/backend/data/demo_discord_messages.csv"
df.to_csv(csv_path, index=False)
print(f"Generated {len(df)} messages and saved to {csv_path}")
print(f"Sentiment distribution:\n{df['sentiment_label'].value_counts()}")
print(f"Top channels:\n{df['channel'].value_counts()}")
