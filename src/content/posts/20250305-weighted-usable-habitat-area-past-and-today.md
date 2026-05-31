---
title: Weighted Usable Habitat Area in the Past and Today
published: 2025-03-05
author: Sebastian
description: A walk through how Weighted Usable Area (WUA) is calculated, and why moving to 2d needs care.
cover: "/assets/images/banner-conferences.jpg"
coverInContent: false
tags: [Story, Habitat]
category: Story
draft: false
---

This blog post is going to be a bit less waggish than my previous one on [slugs](https://ecohydraulics.org/slug/), but I hope you will still find it an interesting read.

Weighted Usable habitat Area (WUA) was introduced in [Bovee (1986)](https://digitalmedia.fws.gov/digital/api/collection/document/id/1770/download) and further elaborated in [Stalnaker et al. (1995)](https://apps.dtic.mil/sti/citations/ADA322762) to assess the availability and quality of aquatic habitats. The calculation of WUA requires one-dimensional (1d), cross section-averaged information on hydraulics (flow velocity and water depth) and a representative grain size. Early WUA approaches therefore relied on simplified 1d assessments. However, many of these simplifications, especially the 1d modeling assumptions, are not so relevant today because two-dimensional (2d) simulations have become more affordable to run, at least for purely hydrodynamics.

To translate WUA assessments into 2d space, some researchers have proposed an intriguingly straightforward method that applies habitat suitability curves to 2d numerical simulation output, then multiplies the combined habitat suitability index of each pixel by the pixel area (see for example, [Tuhtan et al. (2012)](https://doi.org/10.1007/s12205-012-0002-5) or [Yao et al. (2018)](https://onlinelibrary.wiley.com/doi/abs/10.1002/eco.1961)). This approach has been criticized for treating suitability indices as though they were probabilities used to calculate the statistical mean of a dataset, even though they are not probabilities, and it can also lead to confusion because of an ambiguous calculation of WUA.

To better understand this ambiguity, let's take a moment to walk through a simplified version of how WUA is calculated:

1. Start by defining habitat suitability curves that link suitability indices to water depth, flow velocity, substrate type, and potentially other variables. Each curve assigns a suitability index (SI) ranging from 0 (unsuitable) to 1 (highly suitable) for each variable.
2. Next, use a 1d hydraulic model to produce depth and velocity data for representative cross-sections in a river segment. The 1d model calculates cross section-averaged flow velocity and water surface elevation along the river centerline.
3. Based on the 1d-hydraulic model results, compute the habitat suitability index SI for each variable (depth, velocity, substrate, etc.) at every cross-section. For instance, SI<sub>h</sub> for depth, SI<sub>u</sub> for velocity, and SI<sub>d</sub> for substrate (where d refers to the diameter of a substrate grain).
4. Combine the individual suitability indices by multiplying them to obtain the total suitability index at each location: SI<sub>total</sub> = SI<sub>depth</sub> · SI<sub>velocity</sub> · SI<sub>substrate</sub>.
5. Multiply SI<sub>total</sub> by the wetted width of each cross-section to find the Weighted Usable Width: WUW = SI<sub>total</sub> · width.
6. Finally, add up the products of WUW and the representative lengths Δx of considered river reaches across all cross-sections to determine the Weighted Usable habitat Area: WUA = ∑<sub>i=1</sub><sup>n</sup> WUW<sub>i</sub> · Δx, where n is the number of cross-sections.

2d modeling already modifies Step 2, producing depth-averaged flow velocity and water depth maps that enable the calculation of SI<sub>total</sub> for each pixel. This leads to the intriguing expression for computing WUA as a function of the pixel area A<sub>px</sub>:

WUA = A<sub>px</sub> · ∑ SI<sub>total, px<sub>i</sub></sub>,

where px<sub>i</sub> refers to each pixel. Although this formulation sounds intuitively straightforward, it diverges from the original WUA concept and can confuse. I personally also find it difficult to interpret: what does the sum of pixel-index products really mean? Consider 10 pixels, where one has SI<sub>total, px<sub>i</sub></sub> = 1, and all others are 0 - this yields the same result as having 10 pixels with SI<sub>total, px<sub>i</sub></sub> = 0.1. Because 0.1 is nearly unsuitable habitat, it would be surprising to see any fish in that entire area. Yet if there is a single pixel with SI<sub>total, px<sub>i</sub></sub> = 1, fish might use exactly that spot to rest and recover, just to prepare for swimming as fast as possible through the "ugly" environment of that pixel.

In seemingly endless discussions with ecologists and stakeholders regarding habitat enhancement for the Yuba River in California, we converged on a solution that feels more correct and easier to interpret than the 2d-WUA expression. Specifically, we set a critical threshold SI<sub>crit</sub>, above which SI<sub>total</sub> indicates highly suitable habitat for a particular fish species at a given lifestage. Then, we compute the Usable habitat Area, UHA, by summing the areas of all pixels whose SI<sub>total</sub> values exceed this threshold:

UHA = px<sub>a</sub> · ∑ px<sub>i</sub>(SI<sub>total, px<sub>i</sub></sub> > SI<sub>crit</sub>).

SI<sub>crit</sub> is often chosen between 0.4 and 0.7, depending on the strictness of the assessment (read more in our paper introducing [River Architect / Schwindt et al. (2020)](https://doi.org/10.1007/s12205-012-0002-5)).

As an additional explanation, habitat suitability curves illustrate how environmental factors such as water depth and flow velocity influence the well-being of a specific fish species at a certain lifestage in a particular river. Each curve only applies to the species, lifestage, and river from which its data were originally obtained, so it does not necessarily hold true for different environmental settings or other fish populations because habitat preferences are most likely just "relative preference in that river".

In the meantime, rather than using the product of SI values for each parameter (see Step 4), ecohydraulicists found it more realistic to rely on the geometric mean:

SI<sub>total</sub> = (Π<sub>par</sub> SI<sub>par</sub>)<sup>1/n</sup>.

For example, combining SI<sub>h</sub> and SI<sub>u</sub> through the geometric mean leads to SI<sub>total</sub> = (SI<sub>h</sub> · SI<sub>u</sub>)<sup>1/2</sup>.

All of these assessments ultimately refer to snapshots of physical conditions, meaning they are valid only for the specific topography that was simulated. Once a flood alters the morphological structures, the habitat assessment changes. As the calculations consider only physical parameters, there is no guarantee that fish will actually occupy the habitat. Imagine a river with near-perfect suitability indices everywhere, but in reality, the water is too polluted, too warm, or too turbid for fish to spend their lives. They might simply blob away, despite all physically promising indices.

Before the tone of this post becomes too glum: the imperfections in habitat modeling and assessment have already inspired numerous research papers, presentations, and discussions that keep our community vibrant. Seeking a new research project? Open Pandora's box on Ecohydraulics and be prepared for a flood of fresh ideas!

## Sources

- Bovee, K.D., 1986. Development and evaluation of Habitat Suitability Criteria for use in the instream flow incremental methodology (Biological Report No. 21), Instream flow information paper. National Ecology Center, U.S. Fish and Wildlife Service, Fort Collins, CO, USA.
- Schwindt, S., Larrieu, K., Pasternack, G.B., Rabone, G., 2020. River Architect. SoftwareX 11, 100438. <https://doi.org/10.1016/j.softx.2020.100438>
- Stalnaker, C., Lamb, B.L., Henriksen, J., Bovee, K., Bartholow, J., 1995. The Instream Flow Incremental Methodology - A Primer for IFIM, Biological Report. National Biological Service, U.S. Department of the Interior, Washington, D.C., USA.
- Tuhtan, J.A., Noack, M., Wieprecht, S., 2012. Estimating stranding risk due to hydropeaking for juvenile European grayling considering river morphology. KSCE Journal of Civil Engineering 16, 197-206. <https://doi.org/10.1007/s12205-012-0002-5>
- Yao, W., Bui, M.D., Rutschmann, P., 2018. Development of eco-hydraulic model for assessing fish habitat and population status in freshwater ecosystems. Ecohydrology 11, 1–17. <https://doi.org/10.1002/eco.1961>
