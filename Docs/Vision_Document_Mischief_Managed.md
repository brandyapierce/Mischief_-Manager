Now I'd like to share my vision for this app. I work at an animal Sanctuary and it is in need of updated processes.

It will be an app that keeps track of multiple processes but I'd like to begin with the most critical one first. That is keeping track of the staff and the animal care. Dashboard: We (management) want to see where everyone is located and how much of their list they have accomplished. Each person signs in (and out) at the QR code in the front. They are greeted with a task list that is overlayed on a map of the sanctuary that is prioritized by need first then efficiency. Each employee/volunteer goes to the section designated on the map for the beginning of the shift. They sign in at a QR code at each area. the QR Code brings up buttons with pictures of each animal with their name and species (ex. Mave, Binturong). They click on the button of the animal they're working with. That brings up a prioritized checklist of things that need to be addressed that they check through as they're going, or once they're done. These include Feed, Clean, Signs of Life/Health, Secure. The Clean button brings up it's own sub checklist of clean poop, clean cage, clean animal, clean feeding device, clean drinking device, clean toys, clean habitat. If an animal needs to be fed, it details what it needs to be fed and how that food needs to be prepared if the detail is clicked on. in fact, every option that could have a information or how to icon, should. 


Management can also see all of this action in near real time - where people were last/currently, the habitats and It would be nice to have a color assigned to it. If nobody has been there that day, the area is red. Once someone signs in then the area goes green. It gradually changes back to red if the checklist is not being checked off. Management can see a symbol of some sort in that section if there is a note left by the employee/volunteer. The volunteer/employee has the option to check an N/A option for a chore that may not apply for that day. The director should have the option to pre-assign any and all sections to whomever she wishes. All trainees should need to have their section approved.

The different areas are Bird Building, Nocturnal Budling, Pigeons, Chickens, Reptile Barn, Garage, Back Porch, Back Deck, Pasture, Front Yard, Middle Area(Porcupines, Pigs), House Animals, Foxes/Raccoons/Koi/Coati/Owls, Vultures, Anteater, Ostriches, barn cats, commissary, binturong/lemur barn. There are also other tasks such as doing the morning dishes, picking up afternoon bowls for washing, poop scooping, opening bathrooms, opening lobby, morning walkthrough checking for signs of life. 

Ultimately the app will also have sections that different employees can use to manage their jobs. For example, the employee manager will have section to help keep track of the training each employee and volunteer needs to have done, a contact list, a schedule that can be filled in weekly. The Animal care manager will be able to keep track of inventory, keep notes about needs of specific animals such as medication given, vet notes etc. It would also be nice to be able to ultimately check customers in using the app so that money is easily kept track of weekly, bills can be paid, orders can be made by the Director or financial officer.

---

I am going to become the manager of Animal Ed.Ventures in Coates, NC - an animal sanctuary. Currently there are some really cool and exotic animals but the venture needs a lot of help. specifically with infrastructure and processes, which is what we will be focusing on. The sanctuary currently gets a steady trickle of volunteers and visitors. Just enough of the former to keep the place running and not nearly enough of the latter to keep things going for much longer. So we need to reverse this trend. Starting with the processes and experience

Experience priority
1. Animal
2. Guests
3. Volunteers
4. employees
5. Managers
6. Owner

We are going to be building a Proof of concept (PoC), focusing on the slice of the manager experience. Focusing even further on the tracking of the volunteers and employees and their progress in their tasks and duties and tracking the animals needs. Ideally, I'd like it to feel like this:

... I click on the people logo and I get a rough 3d massing/model of the property overlayed with the geospatial data of the volunteers and employees. The tasks that are at the highest priority of needing to be done is in a list on the right and in red. the people are tagged on the map. They logged in earlier, perhaps with a QR code at the front. maybe they're tracked by gps or RFID triangulation on the badges or something. i can click on any of the people and details will come up about what they're currently doing, what they've done and what they still need to do as well as a way to make an auditory queue on their app to signal them I need to talk to them and be able to communicate in realtime with them through the app.

I click on the animal logo and I get the same 3d model/map but with the animal layover. each animal space has their name and species along with 3 colored bars that go from green (good), to yellow (will need attention soon), to red (needs attention now). the 3 colored bars will be labeled F(ood), C(lean), L(ife) and a lock icon for 'secured'.

## Sanctuary Operating Rules and Checklist Requirements

### Sanctuary Hours

- Open Wed through Sun 11am to 4pm
- Closed Mon and Tues
- Any work done overnight counts for the day before
- New work day on the app begins at 7am each morning

### Bird Seed Tracking

There needs to be a way to track the amount of bird seed in bird areas. The user should be able to mark the current seed level for each bird area. If the seed bin is empty, the app should show refill instructions and/or the location to go to refill the bin.

Product requirements:

- Bird area checklist item includes bird seed status
- Bird seed level can be marked by the employee or volunteer
- Empty state triggers help text with refill instructions and bin location
- Refill instructions should be visible without leaving the checklist flow

### Dropping Bowls Sign-Off

All animals except birds are delivered food during the day. The operational term for this task is "Dropping Bowls." This is a separate workflow from the cleaning checklist and should not be grouped into cleaning or zone cleanup completion.

A person may complete the cleaning checklist and close out the zone as clean, while a different person completes the bowl-drop task later in the day. The app should allow an employee or volunteer to sign off that a bowl was dropped using their initials, independent of the cleaning checklist status.

Product requirements:

- Dropping Bowls is a separate task group from cleaning
- A cleaned zone can still be marked complete for cleaning while bowl drops remain pending
- Each bowl-drop task can be marked complete with initials
- Signature/initials should be tied to the person who completed the drop
- The task should be visible in progress tracking for that zone/animal area
- The system should support a quick sign-off workflow for daily feed delivery tasks
- Bowl-drop completion should not automatically reset or negate the cleaning checklist

### Current Zone and Checklist Inventory

This is the working zone list and checklist inventory for the initial PoC, which may change later as operations evolve.

Front Yard
- Exotic birds
- Ducks
- Turtle
- Plants

Commissary
- Dishes
- Bowl Collection
- Bowl Stacking
- Food Sorting
- Floor Mopping

Garage
- Sloth Cages A & B
  - Signs of life
  - Betong water
  - Sloth water
  - Poop scoop
  - Collect old food bowls and old food
- Fish Tank
  - Signs of life
  - Fill water
- Abby (Toucan)
  - Signs of life
  - Fresh water
  - Food
- Parrot
  - Signs of life
  - Fresh water
  - Food
  - Poop scoop
- Monkeys
  - Signs of life
  - Fresh water
  - Old food bowl collection
  - Poop scoop
- Tiny Birds
  - Signs of life
  - Fresh water
  - Food
- Sweep floor
- Mop floor
- Doors open
- Lights on
- Water jugs full
- Clear spiderwebs

Foxes/Racoons/Owls/Koi/Coati
- Foxes
  - Signs of life
  - Fresh water
  - Food
  - Clear spiderwebs
  - Poop scoop
- Racoons
  - Signs of life
  - Fresh water
  - Poop scoop
  - Spider webs
  - Fresh bath water
- Owls
  - Signs of life
  - Clear old mice
  - Spray down platforms
  - Scrub old poop
- Coati
  - Signs of life
  - Poop scoop
  - Fresh water
  - Collect old bowls
  - Clear spiderwebs

Nocturnal Building
- Bats
  - Signs of life
  - Fresh water
  - Collect old bowls/old food
  - Clean glass
  - Poop scoop
- Bush Babies
  - Signs of life
  - Collect old bowls/old food
  - Poop scoop
  - Clean glass
- Sterling Animals
  - Signs of life
  - Collect old bowls/old food
  - Fresh water
  - Poop scoop

Bird Building
- Signs of life
- Fresh water
- Bird seed
- Bird seed level
- Spiderwebs

Pigeons
- Signs of life
- Fresh drinking water
- Fresh bath water
- Bird seed
- Bird seed level
- Scrub poop off of perches and houses
- Spiderwebs

Back Porch
- Chinchillas
  - Signs of life
  - Food top off
  - Water top off
  - Spot clean or fresh flakes
- Sugar Gliders
  - Signs of life
  - Fresh paper lining
  - Water top off
  - Collect old bowls/food
- Isolation
  - Signs of life
  - Fresh water
  - Bowl collection
  - Fresh paper/flakes/blankets
- Sweep floor

Back Deck Owls
- Signs of life
- Fresh water
- Collect old mice
- Scrub poop off of perches and floor

Vultures
- Signs of life
- Spray/clean food surface
- Collect old mice
- Fresh water

Chickens
- Signs of life
- Fresh water
- Bird seed
- Bird seed level
- Spray and clean platforms
- Refill bird seed bin

Binturong/Lemurs
- Signs of life
- Fresh water
- Poop scoop
- Collect old bowls

Barn Cats
- Signs of life
- Fresh water
- Top off food

Reptile Building
- Snakes/Lizards
  - Signs of life
  - Fresh water
- Bush Babies
  - Signs of life
  - Fresh water
  - Collect old bowls/food
  - Spot clean/poop scoop
- Owl
  - Signs of life
  - Fresh water
  - Scoop old mice
  - Spray/scrub poop off of perches
- Sterling's People
  - Signs of life
  - Fresh water
  - Collect old bowls/food
- Armadillo and Friend
  - Signs of life
  - Fresh water
  - Collect old bowls/food
- Outside Animals
  - Signs of life
  - Fresh water
  - Collect old bowls/food
  - Poop scoop

Middle Area
- Pigs
  - Signs of life
  - Clean food trough
  - Fresh water for both pigs
  - Poop scoop
  - Fill pool if applicable
- Porcupines
  - Signs of life
  - Fresh water
- Skunk
  - Signs of life
  - Fresh water
  - Collect old bowls
- Prairie Dog
  - Signs of life
  - Fresh water
  - Collect old bowls

House Animals
- Birds
  - Signs of life
  - Fresh water
  - Bird seed
- Cats
  - Signs of life
  - Litter box
  - Food bowl
- Dogs
  - Signs of life
  - Fresh water
  - Dog food
- Badger
  - Signs of life
  - Fresh water

Ostriches
- Signs of life
- Fresh water
- Top off food

Pasture
- Signs of life
- Fill water trough
- Spread out bales of hay
- Muck the stalls

### Product Guidance for This Requirement Set

This requirement set confirms that the app must support:

1. Structured daily work windows with shift timing and overnight rollover rules
2. Bird-seed monitoring with refill instructions and a low/empty state
3. Bowl-drop completion tracking using initials for each task
4. Zone-by-zone checklists as the core operational workflow
5. Sign-in and sign-out state tracking tied to area assignments and completion status

These rules should be treated as the current working baseline for the manager dashboard, sign-in flow, checklist experience, and zone status logic.

