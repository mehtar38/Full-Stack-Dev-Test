# Field Estimate Tool

## Approach 

I understand that the goal was to simply make the workflow quick and intuitive without overengineering the prototype. I decided to keep the JSON data as the source of truth rather than introducing DB persistence or REST APIs that were not required for the current workflow. I studied the data, understood how it was connected, then used it to reduce manual entry wherever possible. Customer and equipment information is automatically populated when it can be determined reliably and manual entry by technician is added otherwise.

### What I have done 

I built a web app with form fields for the technician. 
Please find it hosted at: https://mehtar38.github.io/Full-Stack-Dev-Test/

Workflow as follows: 
- Tech login button on the top right corner of the home page to allow for access control (not identity authentication). The passcode is 'hvac'. 
- Workflow starts with customer information which can be manually added or selected. 
- Once selected, Work on equipment is grouped as Work Item. Work item includes Equipment Info, Job Type and Labor cost. Multiple Work Items can be added under the same customer because different equipment or services may require different types of work.
- Known equipment is populated from the provided catalog. For new or unrecognized equipment, the technician can enter the brand/model manually and choose between category-based median pricing, requesting pricing from the office, or entering a custom price.
- Labor rates to be chosen from the max and min limit mentioned in the data, options given are based on chosen Job Type. 
- A discount page to adjust rates if needed. 
- A final review where the technician adds their name, can then present the estimate and download it as a PDF.
- A sticky live estimate builder, compatible with the mobile screen as well. 

### If I had more time 

- With more data as well, I would add persistence to a DB to save manually added info as well. 
- Replace the prototype shared passcode with individual technician authentication and authorization.
- Refine the UI
- Add image recognition for models, potentially recognizing the brand and model, suggesting customers based on that and thus, making the process faster. 

### Assumptions made 

- The provided job type and labor rate data is exhaustive for the available job types and labor levels.
- For unrecognized equipment, the median price of the matching equipment category is used only as a provisional estimate.

------------------------------------------


## The Problem

Our HVAC technicians are losing time on every service call.

Right now, when a tech gets to a job site and needs to give the customer an estimate, here's what happens: they flip through a product binder or scroll through a spreadsheet on their phone, look up equipment costs, try to remember the labor rates for different job types, factor in the specifics of the property, and then scribble numbers on a notepad or punch them into a calculator. Sometimes they call the office to double-check pricing. Sometimes they guess and adjust later.

The customer is standing there the whole time.

A simple repair estimate might take 10-15 minutes. A full system replacement quote can take 30-45 minutes on-site, and that's before the tech has to go back to their truck to write it up in a way the customer can actually read. Some techs text a photo of their handwritten notes to the office and have someone there type it up. Others just wing it and send a "real" estimate later that evening.

We've got about 40 technicians in the field. If each one does 4-6 estimates a day, that's a lot of wasted time — and a lot of customers standing around waiting. We've heard from customers that the wait makes the whole experience feel less professional, and we've definitely lost jobs because a competitor got a clean estimate out faster.

## What We Have

In the `data/` folder, you'll find some of the information our techs work with:

- **equipment.json** — Our catalog of HVAC equipment and parts with pricing
- **labor_rates.json** — What we charge for different types of work
- **customers.json** — A sample of customer and property records

This is real-ish data pulled from our systems. It's not perfect — some of it was exported from different tools at different times, so it might not all look the same.

## What We're Asking

Build something that helps.

Fork this repo, build your solution, and include a short write-up explaining your approach — what you built, why you made the choices you did, and what you'd do differently with more time.
