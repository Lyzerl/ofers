document.addEventListener('DOMContentLoaded', function() {
    let menuData, priceListData;

    fetch('menu.csv')
        .then(response => response.text())
        .then(text => {
            menuData = parseCSV(text);
            populateMenuTypes();
        });

    fetch('pricelist.csv')
        .then(response => response.text())
        .then(text => {
            priceListData = parseCSV(text);
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
        
        const categories = [
            { name: 'סלטים', count: selectedMenu[1], maxPrice: Infinity },
            { name: 'מנות ראשונות', count: selectedMenu[2], maxPrice: selectedMenu[3] },
            { name: 'מנות עיקריות', count: selectedMenu[4], maxPrice: selectedMenu[5] },
            { name: 'תוספות', count: selectedMenu[6], maxPrice: selectedMenu[7] },
            { name: 'קינוחים', count: 1, maxPrice: selectedMenu[8] },
            { name: 'לחמניות', count: selectedMenu[9], maxPrice: Infinity }
        ];

        categories.forEach(category => {
            const categoryItems = priceListData.filter(item => item[0] === category.name && item[2] <= category.maxPrice);
            
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
                    option.textContent = item[1];
                    select.appendChild(option);
                });
                
                formGroup.appendChild(label);
                formGroup.appendChild(select);
                categoryItemsDiv.appendChild(formGroup);
            }
            
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.textContent = `הוסף ${category.name}`;
            addButton.onclick = () => addExtraItem(category.name, categoryItemsDiv);
            categoryItemsDiv.appendChild(addButton);
            
            categoryDiv.appendChild(categoryItemsDiv);
            menuItems.appendChild(categoryDiv);
        });
        
        calculateTotal();
    }

    function addExtraItem(category, categoryItemsDiv) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = `${category} נוסף:`;
        
        const select = document.createElement('select');
        select.name = `${category}_extra`;
        select.onchange =
