import Alpine from 'alpinejs';

const columns = [];
document.querySelectorAll('th').forEach((element) => columns.push({
    id: element.id,
    html: element.querySelector('a'),
}));

Alpine.data('tableData', () => ({
    loading: true,
    statusBar: true,
    status: '',
    people: [],
    toggle() {
        this.loading = !this.loading;
        setTimeout(() => {
            this.statusBar = !this.statusBar;
        }, 3000);
    },
    async getPeopleWithPlanets() {
        try {
            let num = 0;
            this.status = 'Loading characters data...';
            const response = await fetch('https://swapi.dev/api/people');
            const json = await response.json();
            json.results.forEach((element) => {
                element.num = ++num;
                element.home = '-';
                this.people.push(element);
            });
            while (json.next != null) {
                const nextResponse = await fetch(json.next);
                const nextJson = await nextResponse.json();
                json.next = nextJson.next;
                nextJson.results.forEach((element) => {
                    element.num = ++num;
                    element.home = '-';
                    this.people.push(element);
                });
            }
            this.status = 'Loading planets data...';
            const planets = [];
            let uniqPlanets = [];
            const planetNames = [];
            let result;
            this.people.forEach((element) => planets.push(element.homeworld));
            uniqPlanets = [...new Set(planets)];

            async function getPlanet(planetLink) {
                const response = await fetch(planetLink);
                const json = await response.json();
                return json.name;
            }

            for (const planet of uniqPlanets) {
                planetNames.push({link: planet, name: await getPlanet(planet)});
                result = planetNames.find((obj) => obj.link === planet);
                this.people.forEach((element) => {
                    if (element.homeworld === planet) {
                        element.home = result.name;
                    }
                });
            }
            this.toggle();
            setTimeout(() => this.status = 'Everything is loaded!', 300);
        } catch (error) {
            this.status = error;
        }
    },
}));

Alpine.data('tableSorting', () => ({
    sortBy: '',
    sortAsc: false,
    sortByColumn(id, $event) {
        if (this.sortBy === $event.target.innerText) {
            if (this.sortAsc) {
                this.sortBy = '';
                this.sortAsc = false;
                this.iconSortDesc(id);
            } else {
                this.sortAsc = !this.sortAsc;
                this.iconSortAsc(id);
            }
        } else {
            this.sortBy = $event.target.innerText;
            this.iconSortDesc(id);
        }

        this.getTableRows()
            .sort(
                this.sortCallback(
                    Array.from($event.target.parentNode.children).indexOf(
                        $event.target,
                    ),
                ),
            )
            .forEach((tr) => {
                this.$refs.tbody.appendChild(tr);
            });
    },
    getTableRows() {
        return Array.from(this.$refs.tbody.querySelectorAll('tr'));
    },
    getCellValue(row, index) {
        return row.children[index].innerText;
    },
    sortCallback(index) {
        return (a, b) => ((row1, row2) => (row1 !== ''
        && row2 !== ''
        && !isNaN(row1)
        && !isNaN(row2)
            ? row1 - row2
            : row1.toString().localeCompare(row2)))(
            this.getCellValue(this.sortAsc ? a : b, index),
            this.getCellValue(this.sortAsc ? b : a, index),
        );
    },
    iconSortAsc(id) {
        const icon = this.iconFind(id);
        this.iconsReset();
        icon.className = 'sort-asc';
    },
    iconSortDesc(id) {
        const icon = this.iconFind(id);
        this.iconsReset();
        icon.className = 'sort-desc';
    },
    iconFind(id) {
        return columns.find((obj) => obj.id === id).html;
    },
    iconsReset() {
        columns.forEach((element) => {
            if (element.html.className !== 'sort-by') {
                element.html.className = 'sort-by';
            }
        });
    },
}));

window.Alpine = Alpine;

Alpine.start();
