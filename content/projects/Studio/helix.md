---
title: Helix
listed: true
categories:
  - studio
start: 2020
summary: A self-built slit-scanning machine capturing spatiotemporal views of
  personal objects, used to create a self-portrait image series.
themes:
  - childhood & family
  - perception & representation
medium:
  - image
  - object
interactive: false
materials: Computational photography. Mechanically generated images.
context: Experimental Capture, Spring 2020
tint: "#e96aa0"
---
For my final project in ExCap, I built a slit-scanning machine to capture spatiotemporal views of personal objects, which resulted in a self-portrait series.

### EMPATHY

These are cooking utensils, which represent, more literally, my family’s love for food, but also my devotion to love in general. Every evening growing up, my family would sit down to a home-cooked dinner together, dropping our electronics, homework, or whatever else we were working on, and come together to eat and discuss our days and anything exciting (or depressing) that was going on in the world. Even if I didn’t know it until recently, this has been one of the most defining aspects of my life. Dinner is where I learned how to be polite and listen, make eloquent conversation, and understand and appreciate love. I am so grateful that this is how my family brought me up, and I plan to do the same with my own children someday.

### CONFIDENCE

This is my wide-tooth hair comb, designed specifically for curly hair. Over the last few years, I’ve come to love my curly hair — and I used to really hate it. At the same time, my love for other aspects of myself, my abilities, and my decisions has also increased. I find that since coming to college and being even more independent than I was before it, I’m becoming more and more fearless. I know what I want, and I’m not afraid to ask for it. I think my hair was the key to my internal freedom.

### CURIOSITY, SPIRITUALITY

This is a glass clock. I grew up interested in a myriad of subjects, and one of my all time favorite fascinations is theoretical physics and the concept of dimensions and spacetime. I was recently writing a final paper for another class about the fourth dimension, and when she was in the room I asked my mom if she though time was another dimension. It led to an incredibly passionate conversation about our philosophies of life, religion, and spirituality, which I have only recently begun to understand for myself, and I connected with her an an entirely different level. The mixing of time and space is an idea that fascinates my entire family, and is becoming one of the main explorations in my art practice.

### RESOURCEFULNESS, DRIVE

This is a roll of Scotch tape, and this image is the epitome of this project — it illustrates my ability to accomplish my goal for this project despite the awful situation we’re in. As I have explained below, I created an entirely automatic rotation machine out of Arduino materials I happened to have in my closet, cardboard from all the boxes of groceries we’ve ordered, a Lazy Susan from my spice cabinet, corks from wine bottles, Scotch tape and a lot else, in order to pursue my visions for this project. I’ve always been this way: whenever there’s a problem, I set out to fix it in any way.

### MELOMANIA

This one is a combination of music materials, including headphones, a guitar pick, and a mini amp. This aspect of me isn’t very deep — I just love music. I listen to and play it all the time. Plus it especially connects me to my dad.

### Process

Due to COVID, the second half of Experimental Capture was spent at my home in Boston, with no access to the STUDIO’s fancy capture equipment. The transition to remote learning was quite hectic, so Golan decided that completing a formal final project would be optional, and everyone could work at their own pace. Fortunately, I had already become obsessed with slit scanning since the last project (Shapes of Love), and there are many iPhone apps to make it happen, so I was determined to explore it during the remainder of the semester.

In my initial research, I was really inspired by artists who spun flowers during the scans to create fluid helical shapes. The first task I gave myself was replicating this shape.

I could deduce from these images that the flowers were rotating before the camera (or the camera was rotating around the flowers, but this seemed less likely), so I brainstormed how I could get a smooth rotation — this is why I used a lazy susan in my device. I stole it from my spice cabinet and wrapped a string around the perimeter so that I could pull it, rotating an object on top of the lazy susan. The first trials came out like these:

When I discussed these trials with the class, we realized that they resemble strange 3D sculptures and that I should experiment with photogrammetry as well, taking slit scans from multiple angles to fabricate spacio-temporal 3D models. This is where I decided to automate my rotation mechanism—photogrammetry needs perfectly aligned images, and as a human it was impossible to pull the string on the lazy susan with a constant force, which I realized from the inconsistencies in the “objects” in the above images. You need to have enough overlapping landmarks in the 2D photos so that the software can match and stitch the landmarks together into a 3D shape. This meant that my device would would have to fully rotate the object with the exact same speed, while also making sure the rotating object always ended up facing the same direction it started in, so the coil of the “object” would appear consistent from the different angles I slit-scanned from.

Here are some videos of the fabrication process. I went through a few iterations of “gear” systems with string and cardboard until I came up with the loop of yarn in the third video.

Unfortunately, I never achieved the 3D sculptures. Either my computer was not strong enough to handle these strange images, or it is just impossible altogether to create slit scanned sculptures, as the software crashed every single time I tried to build the models. I did end up with some cool GIFs, however, which kind of simulate what a 3D could look like:

And here are some details of my final contraption:

Overall this was a crazy cool project and I’m so happy I discovered slit-scanning. I definitely want to continue with the photogrammetry experiments to see if I can create something in 3D.