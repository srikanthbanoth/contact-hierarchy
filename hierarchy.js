import { LightningElement, track,api } from 'lwc';
import gethierarchy from '@salesforce/apex/Hierarchy.getHierarchy';
export default class Contacthierarchy extends LightningElement {
    items;
    directReportee;
    newData;

   
    connectedCallback() {
        gethierarchy()
            .then((result) => {
                console.log(result);
                let newData = result.map((result) => {
                    if (!result.hasOwnProperty('ReportsToId')) {
                        return { ...result, ReportsToId: null };
                    }
                    else {
                        return { ...result };
                    }
                })
                console.log(JSON.stringify(newData));

                this.newData = newData;

                let directReportee = new Map();

                newData.forEach((element) => {
                    if (directReportee.has(element.ReportsToId)) {
                        directReportee.get(element.ReportsToId).push(element);
                    } else {
                        directReportee.set(element.ReportsToId, [element]);
                    }
                });
                directReportee.delete(null);

                console.log(directReportee);
                this.directReportee = directReportee;
            })
            .catch((err) => {
                console.log(err.message);
            })
    }

    handletree(evt) {
        console.log('Event>>', evt.currentTarget.dataset.id);
        let matched = this.newData.filter((item) => item.Id === evt.currentTarget.dataset.id);
        let mainRoot = matched[0];
        console.log(mainRoot);
        let items = this.buildTree(mainRoot);
        console.log(JSON.stringify(items));
        
        console.log(items);
        this.items=items;
        this.json=items;

    }

    buildTree(mainRoot) {
        const items = [
            {
                label: mainRoot.Name,
                name: mainRoot.Name,
                email:mainRoot.hasOwnProperty('Email')===true?mainRoot.Email:null,
                expanded: true,
                items: [],
            },
        ];
        if (this.directReportee.has(mainRoot.Id)) {
            this.directReportee.get(mainRoot.Id).forEach((childNodes) => {
                items[0].items.push(...this.buildTree(childNodes));
            });
        }
        return items;
    }

}