async function renderMap(filtered_map_data) {

    const topology = await fetch(
        'europe.topo.json'
    ).then(response => response.json());

    const data = filtered_map_data;

    Highcharts.mapChart('container', {
        chart: {
            map: topology
        },
        title: {
            text: 'ENGSO Projects Map',
            align: 'left'
        },
        subtitle: {
            text: 'Source: ',
            align: 'left'
        },
        mapNavigation: {
            enabled: true
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '<b>{point.name}</b><br>Lat: {point.lat:.2f}, Lon: ' +
                '{point.lon:.2f}' +
                '<br><span class="fw-bold fst-italic" style="color:blue">{point.project_name}</span>' +
                '<br>{point.project_description}'
        },
        colorAxis: {
            min: 0,
            max: 40,
            minColor: '#FFFFFF', // Color for the minimum value WHITE
            maxColor: '#FF0000'  // Color for the maximum value RED
            
        },
        plotOptions: {
            mappoint: {
                cluster: {
                    enabled: true,
                    allowOverlap: false,
                    animation: {
                        duration: 450
                    },
                    layoutAlgorithm: {
                        type: 'grid',
                        gridSize: 70
                    },
                    zones: [{
                        from: 1,
                        to: 4,
                        marker: {
                            radius: 13
                        }
                    }, {
                        from: 5,
                        to: 9,
                        marker: {
                            radius: 15
                        }
                    }, {
                        from: 10,
                        to: 15,
                        marker: {
                            radius: 17
                        }
                    }, {
                        from: 16,
                        to: 20,
                        marker: {
                            radius: 19
                        }
                    }, {
                        from: 21,
                        to: 100,
                        marker: {
                            radius: 21
                        }
                    }]
                }
            }
        },
        series: [{
            name: 'Europe',
            accessibility: {
                exposeAsGroupOnly: true
            },
            borderColor: '#A0A0A0',
            nullColor: 'rgba(45, 18, 194, 0.5)',
            showInLegend: false
        }, {
            type: 'mappoint',
            enableMouseTracking: true,
            accessibility: {
                point: {
                    descriptionFormat: '{#if isCluster}' +
                        'Grouping of {clusterPointsAmount} points.' +
                        '{else}' +
                        '{name}, country code: {country}.' +
                        '{/if}'
                }
            },
            colorKey: 'clusterPointsAmount',
            name: 'Cities',
            data: data,
            color: Highcharts.getOptions().colors[2], // green color
            marker: {
                lineWidth: 1,
                lineColor: '#fff',
                symbol: 'mapmarker',
                radius: 8
            },
            dataLabels: {
                verticalAlign: 'top'
            }
        }]
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
            project_multi_vue: {}
        };
    },
    computed: {
    },

    methods: {
        fullData_f() {
            var filtered = [];
            var result = this.fullData;
            for (const key in result) {
                // preveri filtre
                // 1. besedilni filter -> name
                // 2. dropdown filter -> project_name

                if (result[key].name.toUpperCase().indexOf(this.filter_text.toUpperCase()) != -1
                    && (result[key].project_name.toUpperCase() == this.project_name_vue.toUpperCase() || this.project_name_vue == "empty")) {


                    // check for multi
                    // 3. multi filter -> sports_category
                    Object.keys(this.project_multi_vue).forEach(sports_category => {
                        if (this.project_multi_vue[sports_category] && sports_category === result[key].sports_category) {
                            filtered.push(result[key]);
                        }
                    });

                }
            }

            // recalculate map
            renderMap(filtered);
            this.project_list = filtered;
        },
        toggle_all(id) {
            // get first
            var val = document.getElementById('engso_multi_all').checked;
            Object.keys(this.project_multi_vue).forEach(key => {
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
                console.log(`Checkbox with ID: ${id} is now ${checkbox.checked ? 'checked' : 'unchecked'}`);
                
                // If you have a category associated with the checkbox, you can log it here
                // For example, if the category is stored in a data attribute:
                const category = checkbox.getAttribute('data-category'); // Assuming you have a data-category attribute
                console.log(`Category: ${category}`);
            } else {
                console.log(`Checkbox with ID: ${id} not found.`);
            }
        }
    },
    beforeMount() {
        const full_data = ref(''); // Initialize full_data as an empty string

        // Fetch data from the JSON file
        fetch('european-train-stations-near-airports.json')
            .then(response => response.json())
            .then(data => {
                full_data.value = data; // Update the reactive variable with the fetched data

                // Iterate over full_data.value and set properties
                full_data.value.forEach(element => {
                    this.project_multi_vue[element.sports_category] = true;
                });


            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });

        this.fullData = full_data;

    }
}).mount('#app');
