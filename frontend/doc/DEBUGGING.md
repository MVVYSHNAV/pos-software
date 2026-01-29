# Debugging Guide: Items Not Showing

## Quick Debugging Steps

### 1. **Open Browser Console**
Press `F12` or `Ctrl+Shift+I` to open Developer Tools, then go to the **Console** tab.

### 2. **Check Console Logs**
Look for these emoji-marked logs I added:

```
🚀 Initializing POS...
✅ POS booted successfully
📦 Loading items with price list: [price_list_name]
✅ Items and categories loaded
📊 POS State: { profile, posLoading, posError, itemsCount, itemsLoading, itemsError }
```

### 3. **Common Issues & Solutions**

#### ❌ **Error: "POS Opening Entry not found"**
**Problem:** No POS Opening Entry exists in the backend

**Solution:**
1. Go to ERPNext: **POS Opening Entry** doctype
2. Create a new entry for today
3. Set the POS Profile and opening amounts
4. Submit the entry
5. Refresh the POS page

#### ❌ **Error: "POS Profile not found"**
**Problem:** No POS Profile configured

**Solution:**
1. Go to ERPNext: **POS Profile** doctype
2. Create a new POS Profile
3. Set required fields:
   - Company
   - Warehouse
   - Selling Price List
   - Payment methods
4. Save and refresh

#### ❌ **itemsCount: 0** (No items fetched)
**Problem:** No items in the system or filters too restrictive

**Solution:**
1. Check if you have items in ERPNext
2. Verify items have:
   - `disabled = 0`
   - `is_sales_item = 1`
3. Go to **Item** list and ensure items exist

#### ❌ **Network Error / API Failed**
**Problem:** Backend not running or API endpoint issues

**Solution:**
1. Check if `bench start` is running
2. Verify you can access: `http://localhost:8000`
3. Check Network tab in DevTools for failed requests
4. Look for CORS errors

### 4. **Check Network Tab**
1. Open **Network** tab in DevTools
2. Refresh the page
3. Look for these API calls:
   - `GET /api/method/tridz_pos.api.pos.get_pos_profile`
   - `GET /api/method/tridz_pos.api.pos.get_opening_entry`
   - `GET /api/resource/Item?...`
   - `GET /api/resource/Item Group?...`

4. Click on each request to see:
   - **Status**: Should be `200 OK`
   - **Response**: Check the data returned

### 5. **Check POS State Object**
In the console, look for the `📊 POS State:` log. It should show:

```javascript
{
  profile: { name: "...", selling_price_list: "...", ... },
  posLoading: false,
  posError: null,
  itemsCount: 10,  // Should be > 0
  itemsLoading: false,
  itemsError: null
}
```

**Red Flags:**
- `profile: null` → POS not booted
- `posError: "..."` → Boot failed
- `itemsCount: 0` → No items fetched
- `itemsError: "..."` → Items fetch failed

### 6. **Manual Data Check**

#### Check if POS Profile exists:
```bash
# In your terminal
cd /home/vyshnav/Tridz/pos2-bench
bench console
```

```python
# In Frappe console
frappe.get_all("POS Profile", fields=["name", "selling_price_list"])
```

#### Check if Items exist:
```python
frappe.get_all("Item", 
    filters={"disabled": 0, "is_sales_item": 1}, 
    fields=["name", "item_name", "item_code"],
    limit=5
)
```

#### Check if POS Opening Entry exists:
```python
from datetime import date
frappe.get_all("POS Opening Entry", 
    filters={"posting_date": date.today()},
    fields=["name", "pos_profile", "status"]
)
```

### 7. **Expected UI States**

#### **Loading State:**
You should see: "Loading POS data..."

#### **Error State:**
Red error box with the error message

#### **Success State:**
- Categories appear in the category bar
- Items display in a grid
- Search bar is functional

#### **Empty State:**
"No items found" message

## Quick Fix Checklist

- [ ] `bench start` is running
- [ ] POS Profile exists and is configured
- [ ] POS Opening Entry exists for today
- [ ] Items exist with `is_sales_item = 1` and `disabled = 0`
- [ ] Browser console shows no errors
- [ ] Network requests return 200 status
- [ ] Hard refresh browser (`Ctrl+Shift+R`)

## Still Not Working?

### Share These Details:

1. **Console Logs** - Copy all console output
2. **Network Tab** - Screenshot of failed requests
3. **POS State Object** - Copy the `📊 POS State:` log
4. **Error Messages** - Any red error boxes on screen

### Common Backend Setup Commands:

```bash
# Create a POS Profile
bench --site [your-site] execute frappe.get_doc({
    "doctype": "POS Profile",
    "name": "Main POS",
    "company": "Your Company",
    "warehouse": "Stores - YC",
    "selling_price_list": "Standard Selling"
}).insert()

# Create sample items (if none exist)
bench --site [your-site] execute frappe.get_doc({
    "doctype": "Item",
    "item_code": "TEST-001",
    "item_name": "Test Item",
    "item_group": "Products",
    "stock_uom": "Nos",
    "is_sales_item": 1,
    "standard_rate": 100
}).insert()
```

---

**Next Step:** Open your browser, press F12, refresh the page, and check the console logs!
