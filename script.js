document.addEventListener('DOMContentLoaded', function() {
    let menuData, priceListData;

    // טעינת קובץ ה-menu.csv
    fetch('menu.csv')
        .then(response => response.text())
        .then(text => {
            menuData = parseCSV(text);
            populateMenuTypes();
            console.log("Menu Data Loaded:", menuData); // לוג לבדוק טעינה של menu.csv
        });

    // טעינת קובץ ה-pricelist.csv
    fetch('pricelist.csv')
        .then(response => response.text())
        .then(text => {
            priceListData = parseCSV(text);
            console.log("Price List Data Loaded:", priceListData); // לוג לבדוק טעינה של pricelist.csv
        });

    function parseCSV(text) {
        return text.trim().split('\n').map(row => row.split(','));
    }

    function populateMenuTypes() {
        const select = document.getElementById('menuType');
        select.innerHTML = '<option value="">בחר תפריט</option>';
        menuData.forEach(row => {
            const option = document.createElement('option');
            option.value = row[0];
            option.textContent = row[0];
            select.appendChild(option);
        });
        document.getElementById('menuType').addEventListener('change', updateMenuItems);
    }

    function updateMenuItems() {
        const menuType = document.getElementById('menuType').value;
        const menuItems = document.getElementById('menuItems');
        menuItems.innerHTML = '';

        if (!menuType) return;

        const selectedMenu = menuData.find(row => row[0] === menuType);
        console.log("Selected Menu:", selectedMenu); // לוג לבדוק את התפריט שנבחר

        const categories = [
            { name: 'סלטים', count: parseInt(selectedMenu[1]) },
            { name: 'מנות ראשונות', count: parseInt(selectedMenu[2]) },
            { name: 'מנות עיקריות', count: parseInt(selectedMenu[4]) },
            { name: 'תוספות', count: parseInt(selectedMenu[6]) },
            { name: 'קינוחים', count: 1 },
            { name: 'לחמניות', count: parseInt(selectedMenu[9]) }
        ];

        categories.forEach(category => {
            if (category.count > 0) { // יצירת תיבות בחירה רק אם יש count חיובי
                const categoryItems = priceListData.filter(item => item[0] === category.name);
                console.log(`Items for category ${category.name}:`, categoryItems); // לוג לבדוק את הפריטים בקטגוריה

                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';

                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category.name;
                categoryDiv.appendChild(categoryTitle);

                const categoryItemsDiv = document.createElement('div');
                categoryItemsDiv.className = 'category-items';

                for (let i = 0; i < category.count; i++) {
                    const formGroup = document.createElement('div');
                    formGroup.className = 'form-group';

                    const label = document.createElement('label');
                    label.textContent = `${category.name} ${i + 1}:`;

                    const select = document.createElement('select');
                    select.name = `${category.name}_${i}`;
                    select.required = true;
                    select.onchange = calculateTotal;

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = `בחר ${category.name}`;
                    select.appendChild(defaultOption);

                    categoryItems.forEach(item => {
                        const option = document.createElement('option');
                        option.value = JSON.stringify({name: item[1], price: item[2]});
                        option.textContent = `${item[1]} - ₪${item[2]}`;
                        select.appendChild(option);
                    });

                    formGroup.appendChild(label);
                    formGroup.appendChild(select);
                    categoryItemsDiv.appendChild(formGroup);
                }

                categoryDiv.appendChild(categoryItemsDiv);
                menuItems.appendChild(categoryDiv);
            }
        });

        calculateTotal();
    }

    function calculateTotal() {
        const menuType = document.getElementById('menuType').value;
        if (!menuType) return;

        const selectedMenu = menuData.find(row => row[0] === menuType);
        if (!selectedMenu) return;

        let basePrice = parseFloat(selectedMenu[10]) || 0;  // מחיר בסיס לתפריט
        let additionalPrice = 0;

        const selects = document.querySelectorAll('#menuItems select');
        selects.forEach(select => {
            if (select.value) {
                const item = JSON.parse(select.value);
                if (select.name.includes('_extra')) {
                    additionalPrice += parseFloat(item.price);
                }
            }
        });

        const deliveryPrice = parseFloat(document.getElementById('delivery').value) || 0;

        const totalPrice = basePrice + additionalPrice + deliveryPrice;

        const summary = document.getElementById('summary');
        summary.innerHTML = `
            <p>מחיר בסיס לתפריט: ₪${basePrice.toFixed(2)}</p>
            <p>תוספות: ₪${additionalPrice.toFixed(2)}</p>
            <p>הובלה: ₪${deliveryPrice.toFixed(2)}</p>
            <p>סה"כ: ₪${totalPrice.toFixed(2)}</p>
        `;
    }
});
