async function renderMap(filtered_map_data) {
  const topology = await fetch("europe.topo.json").then((response) => response.json());

  const data = filtered_map_data;

  Highcharts.mapChart("container", {
    chart: {
      map: topology,
      width: null,
      height: 1000,
      backgroundColor: "#f7f5eb", // Change this for the map background/sea color
    },
    title: {
      text: "",
      align: "left",
    },
    subtitle: {
      text: "",
      align: "left",
    },
    mapNavigation: {
      enabled: true,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      backgroundColor: "none",
      borderWidth: 0,
      shadow: false,
      padding: 0,
      headerFormat: "",
      // ADD THESE TWO LINES:
      hideDelay: 10000, // Sidebar stays for 1 second after mouse leaves
      //stickyTracking: true,
      // This function forces the tooltip to a fixed spot
      positioner: function (labelWidth, labelHeight, point) {
        const chart = this.chart;
        return {
          // X: Chart width minus 40% of the width
          x: chart.chartWidth * 0.6,
          // Y: Top of the chart
          y: 0,
        };
      },
      pointFormat: `
        <div class="barlow-regular" style="
            width: 40vw; 
            height: 1000px; 
            background: rgba(255,255,255,0.95); 
            border-left: 2px solid #43B0F1; 
            padding: 25px;
            box-sizing: border-box;
            white-space: normal;
            overflow-y: auto;
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        ">
            <h2 style="margin-top:0; color:#43B0F1;">{point.project_name}</h2>
            <h4 style="margin-top:0; color:#43B0F1;"> {point.name}/{point.country_full_name}</h4>
            
            <p><b>Lat:</b> {point.lat:.2f}, <b>Lon:</b> {point.lon:.2f}</p>
            
            <p>
            <div style="width: 30vw;">
            <img src="{point.head_image}" class="border  border-rounded rounded rounded-5 shadow" style="width: 30vw; ">
            </p>
            <div style="margin-bottom: 15px;">
            {#each point.sports_category}
                <span class="badge rounded-pill bg-primary p-2 mb-1" style="margin-right: 5px;">{this}</span>
            {/each}
            {#each point.age_groups}
                <span class="badge rounded-pill bg-secondary p-2 mb-1" style="margin-right: 5px;">{this}</span>
            {/each}
            {#each point.target_groups}
                <span class="badge rounded-pill bg-success p-2 mb-1" style="margin-right: 5px;">{this}</span>
            {/each}
        </div>
            <hr>

            <div class="fw-bold">Good practices:</div>
            <ul style="list-style-type: none; padding-left: 0;">
                  {#each point.aspects_of_good_practice}
                <li>{this}</li>
            {/each}
        </div>
            </ul>
            
            <p style="font-size: 1.1em; line-height: 1.5; overflow-wrap: break-word;">{point.project_description}</p>
            
            <div>
              <a class="btn btn-primary mt-3 w-100" href="{point.website}" target="_blank">
                Visit project Website
              </a>
            </div>
            </div>
        </div>
    `,
    },
    colorAxis: {
      min: 0,
      max: 40,
      minColor: "#e1525f", // Color for the minimum value WHITE
      maxColor: "#e1525f", // Color for the maximum value RED
    },
    plotOptions: {
      mappoint: {
        cluster: {
          enabled: true,
          allowOverlap: false,
          animation: {
            duration: 450,
          },
          fillColor: "#e1525f", // Cluster color
          opacity: 1,
          marker: {
            fillOpacity: 1, // Force full color density
          },
          layoutAlgorithm: {
            type: "grid",
            gridSize: 70,
          },
          zones: [
            {
              from: 1,
              to: 4,
              marker: {
                radius: 13,
              },
            },
            {
              from: 5,
              to: 9,
              marker: {
                radius: 15,
              },
            },
            {
              from: 10,
              to: 15,
              marker: {
                radius: 17,
              },
            },
            {
              from: 16,
              to: 20,
              marker: {
                radius: 19,
              },
            },
            {
              from: 21,
              to: 100,
              marker: {
                radius: 21,
              },
            },
          ],
        },
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        stickyTracking: true,
        name: "Europe",
        accessibility: {
          exposeAsGroupOnly: true,
        },
        borderColor: "#A0A0A0",
        nullColor: "rgba(235, 236, 232, 0.8)", // color of land mass
        showInLegend: false,
      },
      {
        type: "mappoint",
        enableMouseTracking: true,
        accessibility: {
          point: {
            descriptionFormat: "{#if isCluster}" + "Grouping of {clusterPointsAmount} points." + "{else}" + "{name}, country code: {country}." + "{/if}",
          },
        },
        colorKey: "clusterPointsAmount",
        name: "Cities",
        data: data,
        color: "#e1525f", // Applied requested coral red color
        marker: {
          lineWidth: 1,
          lineColor: "#fff",
          symbol: "mapmarker",
          radius: 16,
        },
        dataLabels: {
          verticalAlign: "top",
        },
      },
    ],
  });
}

// Call the function to render the map EMPTY
//renderMap({});

const { createApp, ref } = Vue;

createApp({
  data() {
    return {
      // celotna zbirka podatkov
      fullData: "",
      // izbrani projekti po filtru
      project_list: [],

      // filter
      filter_text: "",
      project_name_vue: "empty",
      project_multi_vue: {},
      project_country_vue: "empty",

      // projects
      all_countries: [],
      selected_countries: [],

      all_sports_categories: [],
      selected_sports_categories: [],

      all_target_groups: [],
      selected_target_groups: [],

      all_age_groups: [],
      selected_age_groups: [],
    };
  },
  computed: {},

  methods: {
    fullData_f() {
      const filtered = [];
      const result = this.fullData;

      for (const key in result) {
        const item = result[key];

        // 1. Text Filter (City Name)
        const matchesText =
          item.name.toUpperCase().indexOf(this.filter_text.toUpperCase()) !== -1 ||
          item.project_name.toUpperCase().indexOf(this.filter_text.toUpperCase()) !== -1 ||
          item.project_description.toUpperCase().indexOf(this.filter_text.toUpperCase()) !== -1;

        // 2. Project Name Dropdown
        const matchesProject = this.project_name_vue === "empty" || item.project_name.toUpperCase() === this.project_name_vue.toUpperCase();

        // 3. Country Filter
        const matchesCountry = this.selected_countries.includes(item.country_full_name);

        // 4. Sports Category Filter (Handles strings or arrays)
        const itemSports = Array.isArray(item.sports_category) ? item.sports_category : [item.sports_category];
        const matchesSport = itemSports.some((sport) => this.selected_sports_categories.includes(sport));

        // 5. Target Groups Filter
        const matchesTarget = item.target_groups.some((group) => this.selected_target_groups.includes(group));

        // 6. Age Groups Filter
        const matchesAge = item.age_groups.some((age) => this.selected_age_groups.includes(age));

        // Combined Logic: All must be true
        if (matchesText && matchesProject && matchesCountry && matchesSport && matchesTarget && matchesAge) {
          filtered.push(item);
        }
      }

      // recalculate map and list
      renderMap(filtered);
      this.project_list = filtered;
    },
    toggle_all(id) {
      // get first
      var val = document.getElementById("engso_multi_all").checked;
      Object.keys(this.project_multi_vue).forEach((key) => {
        this.project_multi_vue[key] = val; // Get the value associated with the key
      });
    },
    multi_toggle(id) {
      // Get the checkbox element by its ID
      const checkbox = document.getElementById(id);

      // Check if the checkbox exists
      if (checkbox) {
        // Toggle the checked state
        checkbox.checked = !checkbox.checked;

        // Log the current state and the category (if needed)
        console.log(`Checkbox with ID: ${id} is now ${checkbox.checked ? "checked" : "unchecked"}`);

        // If you have a category associated with the checkbox, you can log it here
        // For example, if the category is stored in a data attribute:
        const category = checkbox.getAttribute("data-category"); // Assuming you have a data-category attribute
        console.log(`Category: ${category}`);
      } else {
        console.log(`Checkbox with ID: ${id} not found.`);
      }
    },
  },

  async beforeMount() {
    try {
      const response = await fetch("european-train-stations-near-airports.json");
      const data = await response.json();

      // 1. Assign the data to your component state
      this.fullData = data;

      // 2. Perform logic ONLY after data is received
      this.fullData.forEach((element) => {
        // Set dynamic properties
        if (element.sports_category) {
          this.project_multi_vue[element.sports_category] = true;
        }

        // Build country list
        if (element.country_full_name) {
          this.all_countries.push(element.country_full_name);
        }
        // make unique
        this.all_countries = [...new Set(this.all_countries)];
        this.selected_countries = [...new Set(this.all_countries)];

        // build sports category list
        if (element.sports_category) {
          element.sports_category.forEach((sport) => {
            this.all_sports_categories.push(sport);
          });
        }
        // make unique
        this.all_sports_categories = [...new Set(this.all_sports_categories)];
        this.selected_sports_categories = [...new Set(this.all_sports_categories)];

        // build target groups list
        if (element.target_groups) {
          element.target_groups.forEach((group) => {
            this.all_target_groups.push(group);
          });
        }
        // make unique
        this.all_target_groups = [...new Set(this.all_target_groups)];
        this.selected_target_groups = [...new Set(this.all_target_groups)];

        // build age groups list
        if (element.age_groups) {
          element.age_groups.forEach((age) => {
            this.all_age_groups.push(age);
          });
        }
        // make unique
        this.all_age_groups = [...new Set(this.all_age_groups)];
        this.selected_age_groups = [...new Set(this.all_age_groups)];
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
}).mount("#app");
