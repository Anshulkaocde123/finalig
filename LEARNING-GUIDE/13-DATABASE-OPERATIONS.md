# Chapter 13: Database Operations Guide - CRUD with Syntax 🗄️

## Comprehensive Guide to All Database Operations

A complete reference for every database operation with syntax, explanations, and practical examples.

---

## Table of Contents
1. [CRUD Overview](#crud-overview)
2. [CREATE Operations](#create-operations)
3. [READ Operations](#read-operations)
4. [UPDATE Operations](#update-operations)
5. [DELETE Operations](#delete-operations)
6. [Advanced Queries](#advanced-queries)
7. [Aggregation Pipeline](#aggregation-pipeline)
8. [Practical Examples](#practical-examples)
9. [Postman Testing](#postman-testing)

---

## CRUD Overview

### What is CRUD?

CRUD = **C**reate, **R**ead, **U**pdate, **D**elete

```
    ┌─────────────┐
    │   Database  │
    │  (MongoDB)  │
    └────────────┬┘
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
   CREATE   READ   UPDATE   DELETE
    │    │    │        │
    └─── New ──┘    Modify    Remove
        Document   Data    Data
```

### HTTP Methods to CRUD Mapping

```javascript
// GET      = READ   (retrieve data)
app.get('/api/departments/:id', getDepartment);

// POST     = CREATE (make new data)
app.post('/api/departments', createDepartment);

// PUT      = UPDATE (replace entire data)
app.put('/api/departments/:id', updateDepartment);

// PATCH    = UPDATE (modify specific fields)
app.patch('/api/departments/:id', updateDepartment);

// DELETE   = DELETE (remove data)
app.delete('/api/departments/:id', deleteDepartment);
```

---

## CREATE Operations

### Syntax 1: Using new + save()

```javascript
// Step 1: Create document object
const newDepartment = new Department({
    name: 'Computer Science',
    shortCode: 'CSE',
    logo: '/uploads/cse.png'
});

// Step 2: Save to database
const savedDepartment = await newDepartment.save();

// Returns saved document with _id:
// {
//     _id: ObjectId("645abc..."),
//     name: 'Computer Science',
//     shortCode: 'CSE',
//     logo: '/uploads/cse.png',
//     createdAt: Date,
//     updatedAt: Date
// }
```

**When to use:**
```
✅ When you want to validate before saving
✅ When you need to do additional operations
❌ When you want quick insert

Example:
const dept = new Department(data);
if (validateCustom(dept)) {
    await dept.save();
}
```

### Syntax 2: Using create()

```javascript
// All in one line (faster)
const department = await Department.create({
    name: 'Electrical Engineering',
    shortCode: 'EE',
    logo: '/uploads/ee.png'
});

// Equivalent to: new + save() but faster
// Returns: saved document with _id
```

**When to use:**
```
✅ When you want quick insert
✅ When you don't need custom validation
❌ When you need step-by-step control

Example:
const dept = await Department.create(req.body);
res.status(201).json({ data: dept });
```

### Syntax 3: Using insertMany()

```javascript
// Insert multiple documents at once
const departments = await Department.insertMany([
    {
        name: 'Computer Science',
        shortCode: 'CSE'
    },
    {
        name: 'Electrical Engineering',
        shortCode: 'EE'
    },
    {
        name: 'Civil Engineering',
        shortCode: 'CE'
    }
]);

// Returns: Array of saved documents
// [
//     { _id: ..., name: 'Computer Science', ... },
//     { _id: ..., name: 'Electrical Engineering', ... },
//     { _id: ..., name: 'Civil Engineering', ... }
// ]
```

**When to use:**
```
✅ Bulk insert from data migration
✅ Seed database with test data
✅ Import from external source

Example:
const data = parseCSVFile();
const saved = await Department.insertMany(data);
console.log(`Imported ${saved.length} departments`);
```

### Syntax 4: With Validation Error Handling

```javascript
async function createWithErrorHandling(data) {
    try {
        const dept = await Department.create(data);
        return {
            success: true,
            data: dept
        };
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(field => {
                errors[field] = error.errors[field].message;
            });
            return {
                success: false,
                errors: errors
            };
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return {
                success: false,
                message: `${Object.keys(error.keyValue)[0]} already exists`
            };
        }
        
        return {
            success: false,
            message: error.message
        };
    }
}

// Usage:
const result = await createWithErrorHandling({
    name: 'CSE',
    // Missing shortCode - will error
});

// Returns:
// {
//     success: false,
//     errors: {
//         shortCode: 'Path `shortCode` is required.'
//     }
// }
```

### Controller Example: CREATE

```javascript
// POST /api/departments
exports.createDepartment = async (req, res) => {
    try {
        // Get data from request body
        const { name, shortCode, logo } = req.body;
        
        // Validate required fields
        if (!name || !shortCode) {
            return res.status(400).json({
                success: false,
                message: 'Name and shortCode are required'
            });
        }
        
        // Create document
        const department = await Department.create({
            name,
            shortCode,
            logo: logo || ''
        });
        
        // Return response with 201 Created status
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
        
    } catch (error) {
        // Handle errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.keys(error.errors).map(field => ({
                    field,
                    message: error.errors[field].message
                }))
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Postman Test:
// POST http://localhost:5000/api/departments
// Body: { "name": "CSE", "shortCode": "cse" }
// Response: 201 Created + New document
```

---

## READ Operations

### Syntax 1: Find by ID

```javascript
// Single specific document
const department = await Department.findById('645abc...');

// Returns:
// {
//     _id: ObjectId("645abc..."),
//     name: 'Computer Science',
//     shortCode: 'CSE',
//     logo: '/uploads/cse.png'
// }

// If not found, returns: null
const notFound = await Department.findById('invalid-id');
console.log(notFound);  // null
```

**Syntax breakdown:**
```javascript
await Department.findById(id);
            │          │     │
            │          │     └─ ID to search for
            │          └─ Model method
            └─ Wait for database

// Equivalent MongoDB:
db.departments.findOne({ _id: ObjectId("645abc...") })
```

### Syntax 2: Find One (First Match)

```javascript
// Find first document matching condition
const department = await Department.findOne({ shortCode: 'CSE' });

// Returns first matching document or null
// {
//     _id: ObjectId("..."),
//     name: 'Computer Science',
//     shortCode: 'CSE'
// }

// Multiple conditions (AND)
const dept = await Department.findOne({
    shortCode: 'CSE',
    isActive: true
});
// Must match BOTH conditions
```

**When to use:**
```
✅ Find unique fields (email, username, code)
✅ Find first match of filter
❌ When you need multiple matches (use find())

Example:
const user = await User.findOne({ email: 'admin@vnit.edu.in' });
if (!user) {
    throw new Error('User not found');
}
```

### Syntax 3: Find Many

```javascript
// Get all documents
const allDepartments = await Department.find();

// Returns array of documents:
// [
//     { _id: ..., name: 'CSE', shortCode: 'CSE' },
//     { _id: ..., name: 'EE', shortCode: 'EE' },
//     { _id: ..., name: 'CE', shortCode: 'CE' }
// ]

// With filter (AND)
const activeDepts = await Department.find({ isActive: true });

// Multiple filters
const filtered = await Department.find({
    shortCode: 'CSE',
    year: 2025
});
// Returns all documents matching BOTH filters
```

### Syntax 4: Find with Chaining

```javascript
// Chain methods for complex queries
const departments = await Department.find()
    .select('name shortCode')           // Select specific fields
    .sort({ createdAt: -1 })            // Sort by date, newest first
    .limit(10)                          // Limit to 10 results
    .skip(0);                           // Skip first 0

// Returns array with:
// - Only name and shortCode fields
// - Sorted by creation date (descending)
// - Maximum 10 results
// - Starting from first document

// Another example:
const expensive = await Product.find({ price: { $gt: 1000 } })
    .select('name price')
    .sort({ price: 1 })                 // Ascending (lowest first)
    .limit(5);
```

**Chaining methods explained:**
```javascript
.select('name shortCode')
// Choose which fields to return
// name, shortCode returned
// Other fields omitted
// Saves bandwidth

.sort({ field: direction })
// 1 = ascending (A to Z, 0 to 9)
// -1 = descending (Z to A, 9 to 0)
// Example: sort({ createdAt: -1 }) = newest first

.limit(10)
// Maximum 10 documents returned
// Use for pagination

.skip(20)
// Skip first 20 documents
// Page 1: skip 0
// Page 2: skip 10
// Page 3: skip 20
```

### Syntax 5: Pagination (Limit + Skip)

```javascript
// Get page 2, with 10 items per page
const page = 2;
const limit = 10;

const departments = await Department.find()
    .skip((page - 1) * limit)   // Skip 10 documents
    .limit(limit)               // Get next 10

// Also get total count
const total = await Department.countDocuments();

// Return response
{
    count: departments.length,   // 10
    total: total,                // 50 (total in db)
    page: page,                  // 2
    pages: Math.ceil(total / limit),  // 5
    data: departments
}
```

**Pagination formula:**
```
Page 1: skip = (1-1) * 10 = 0   items 1-10
Page 2: skip = (2-1) * 10 = 10  items 11-20
Page 3: skip = (3-1) * 10 = 20  items 21-30
```

### Syntax 6: Search with Regex

```javascript
// Case-insensitive search
const departments = await Department.find({
    name: { $regex: 'computer', $options: 'i' }
});
// Matches: "Computer", "COMPUTER", "computer"
// Returns documents with matching name

// Search multiple fields
const results = await Department.find({
    $or: [
        { name: { $regex: 'cse', $options: 'i' } },
        { shortCode: { $regex: 'cse', $options: 'i' } }
    ]
});
// Returns if name OR shortCode matches
```

**Regex operators:**
```javascript
$regex: 'pattern'          // Contains pattern
$options: 'i'              // Case-insensitive
$options: 'm'              // Multiline
{ $exists: true }          // Field exists
{ $in: [value1, value2] }  // In array
```

### Syntax 7: Populate References

```javascript
// Department schema has reference to Season
const match = await Match.findById('645abc...')
    .populate('teamA')      // Replace teamA ID with full document
    .populate('teamB')
    .populate('winner')
    .populate('season');

// Without populate:
// {
//     _id: '645abc...',
//     sport: 'CRICKET',
//     teamA: '645def...',    // Just ID
//     teamB: '645ghi...'
// }

// With populate:
// {
//     _id: '645abc...',
//     sport: 'CRICKET',
//     teamA: {              // Full document!
//         _id: '645def...',
//         name: 'CSE',
//         shortCode: 'CSE'
//     },
//     teamB: { ... }
// }

// Select specific fields from populated document
const match = await Match.findById('645abc...')
    .populate('teamA', 'name shortCode');  // Only name and shortCode
    // Result: teamA has only name and shortCode (plus _id always included)
```

### Controller Example: READ

```javascript
// GET /api/departments
exports.getAllDepartments = async (req, res) => {
    try {
        const { limit = 10, page = 1, search } = req.query;
        
        // Build query
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        // Get total count
        const total = await Department.countDocuments(query);
        
        // Get paginated results
        const departments = await Department.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: departments.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: departments
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET /api/departments/:id
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: department
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

---

## UPDATE Operations

### Syntax 1: findByIdAndUpdate()

```javascript
// Find by ID and update
const department = await Department.findByIdAndUpdate(
    '645abc...',
    { name: 'New Name', logo: '/new-logo.png' },
    { new: true, runValidators: true }
);

// Options:
// new: true          = Return updated document (not old)
// runValidators: true = Run schema validators

// Returns updated document
// {
//     _id: '645abc...',
//     name: 'New Name',        // Updated
//     shortCode: 'CSE',        // Unchanged
//     logo: '/new-logo.png'    // Updated
// }

// If new: false (default)
// Returns old document before update
```

### Syntax 2: findOneAndUpdate()

```javascript
// Find by condition and update
const department = await Department.findOneAndUpdate(
    { shortCode: 'CSE' },           // Condition
    { name: 'Computer Science' },   // Update
    { new: true, runValidators: true }
);

// More flexible than findByIdAndUpdate()
// Can use any condition, not just ID
```

### Syntax 3: updateOne()

```javascript
// Update one document (doesn't return document)
const result = await Department.updateOne(
    { _id: '645abc...' },
    { $set: { name: 'New Name' } }
);

// Returns result object:
// {
//     acknowledged: true,
//     modifiedCount: 1,        // 1 document modified
//     upsertedId: null
// }

// Useful when you don't need the document back
// Faster than findByIdAndUpdate() for bulk updates
```

### Syntax 4: updateMany()

```javascript
// Update multiple documents
const result = await Department.updateMany(
    { year: 2024 },              // Filter
    { $set: { isArchived: true } }  // Update all matching
);

// Returns:
// {
//     acknowledged: true,
//     modifiedCount: 5,    // 5 documents modified
//     upsertedId: null
// }

// Example: Archive all old records
const archived = await Document.updateMany(
    { createdAt: { $lt: new Date('2024-01-01') } },
    { $set: { archived: true } }
);
console.log(`Archived ${archived.modifiedCount} documents`);
```

### Syntax 5: Update Operators

```javascript
// $set - Set field value
await Department.findByIdAndUpdate(id, {
    $set: { logo: '/uploads/cse-new.png' }
});

// $unset - Remove field completely
await Department.findByIdAndUpdate(id, {
    $unset: { obsoleteField: 1 }
    // Field completely removed from document
});

// $inc - Increment number field
await Department.findByIdAndUpdate(id, {
    $inc: { studentCount: 5 }  // Increase by 5
});
await Department.findByIdAndUpdate(id, {
    $inc: { year: -1 }  // Decrease by 1
});

// $push - Add to array
await Department.findByIdAndUpdate(id, {
    $push: { achievements: 'Won Championship 2025' }
});

// $pull - Remove from array
await Department.findByIdAndUpdate(id, {
    $pull: { achievements: 'Old Achievement' }
});

// $addToSet - Add to array (no duplicates)
await Department.findByIdAndUpdate(id, {
    $addToSet: { tags: 'newTag' }
    // Only adds if not already present
});

// $rename - Rename field
await Department.findByIdAndUpdate(id, {
    $rename: { 'oldName': 'newName' }
});
```

**Update operators explained:**
```javascript
// BEFORE:
{
    _id: '...',
    name: 'CSE',
    studentCount: 100,
    achievements: ['Award1', 'Award2'],
    obsoleteField: 'value'
}

// After: await updateOne(id, { $set: { name: 'CS' } })
{
    _id: '...',
    name: 'CS',                          // Changed
    studentCount: 100,
    achievements: ['Award1', 'Award2']
}

// After: await updateOne(id, { $inc: { studentCount: 5 } })
{
    studentCount: 105                    // 100 + 5
}

// After: await updateOne(id, { $push: { achievements: 'Award3' } })
{
    achievements: ['Award1', 'Award2', 'Award3']  // Added to end
}

// After: await updateOne(id, { $unset: { obsoleteField: 1 } })
{
    // obsoleteField completely removed
}
```

### Controller Example: UPDATE

```javascript
// PATCH /api/departments/:id
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Validate ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID'
            });
        }
        
        // Update department
        const department = await Department.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

---

## DELETE Operations

### Syntax 1: findByIdAndDelete()

```javascript
// Find by ID and delete
const department = await Department.findByIdAndDelete('645abc...');

// Returns deleted document (for confirmation)
// {
//     _id: '645abc...',
//     name: 'Computer Science',
//     shortCode: 'CSE'
// }

// If not found, returns null
const notFound = await Department.findByIdAndDelete('invalid-id');
console.log(notFound);  // null
```

### Syntax 2: findOneAndDelete()

```javascript
// Find by condition and delete
const department = await Department.findOneAndDelete({
    shortCode: 'CSE'
});

// More flexible than findByIdAndDelete()
// Deletes first matching document
```

### Syntax 3: deleteOne()

```javascript
// Delete one document (doesn't return document)
const result = await Department.deleteOne({
    _id: '645abc...'
});

// Returns:
// {
//     acknowledged: true,
//     deletedCount: 1  // 1 document deleted
// }

// If no match:
// {
//     acknowledged: true,
//     deletedCount: 0  // No documents deleted
// }
```

### Syntax 4: deleteMany()

```javascript
// Delete multiple documents
const result = await Department.deleteMany({
    year: 2024  // Delete all 2024 records
});

// Returns:
// {
//     acknowledged: true,
//     deletedCount: 5  // 5 documents deleted
// }

// Example: Delete old records
const deleted = await Notification.deleteMany({
    createdAt: { $lt: new Date('2024-01-01') }
});
console.log(`Deleted ${deleted.deletedCount} old notifications`);
```

### Syntax 5: Soft Delete (Mark as Deleted)

```javascript
// Instead of actual delete, mark as deleted
// Safer - can recover data if needed

// Update: Mark as deleted
await Department.findByIdAndUpdate(id, {
    $set: { deletedAt: new Date() }
});

// Query: Get only active (not deleted)
const activeDepts = await Department.find({
    deletedAt: null
});

// Query: Get only deleted
const deletedDepts = await Department.find({
    deletedAt: { $ne: null }
});

// Recovery: Restore deleted
await Department.findByIdAndUpdate(id, {
    $unset: { deletedAt: 1 }
});
```

### Controller Example: DELETE

```javascript
// DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if department exists
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        // Check if department has students (don't delete)
        const Student = require('../models/Student');
        const studentCount = await Student.countDocuments({
            department: id
        });
        
        if (studentCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete. ${studentCount} students belong to this department.`
            });
        }
        
        // Safe to delete
        await Department.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

---

## Advanced Queries

### 1. Comparison Operators

```javascript
// $eq - Equal to
{ age: { $eq: 20 } }      // age == 20

// $ne - Not equal
{ status: { $ne: 'inactive' } }  // status != 'inactive'

// $gt - Greater than
{ price: { $gt: 1000 } }  // price > 1000

// $gte - Greater than or equal
{ score: { $gte: 80 } }   // score >= 80

// $lt - Less than
{ age: { $lt: 30 } }      // age < 30

// $lte - Less than or equal
{ rating: { $lte: 5 } }   // rating <= 5
```

**Examples:**
```javascript
// Get expensive products
const expensive = await Product.find({
    price: { $gt: 5000 }
});

// Get new students (joined in last 30 days)
const newStudents = await Student.find({
    createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
});
```

### 2. Logical Operators

```javascript
// $and - All conditions must be true
{ $and: [
    { age: { $gte: 18 } },
    { status: 'active' }
] }
// Equivalent to: { age: { $gte: 18 }, status: 'active' }

// $or - At least one condition is true
{ $or: [
    { email: 'admin@vnit.edu.in' },
    { role: 'admin' }
] }
// email is admin OR role is admin

// $not - Negates condition
{ age: { $not: { $lt: 18 } } }
// NOT (age < 18) = age >= 18

// $nor - None of conditions are true
{ $nor: [
    { status: 'deleted' },
    { status: 'archived' }
] }
// status is not deleted AND not archived
```

**Example:**
```javascript
// Get active admin students from CSE department
const admins = await Student.find({
    $and: [
        { role: 'admin' },
        { status: 'active' },
        { department: departmentId }
    ]
});

// Get all matches that are completed or cancelled
const finished = await Match.find({
    $or: [
        { status: 'COMPLETED' },
        { status: 'CANCELLED' }
    ]
});
```

### 3. Array Operators

```javascript
// $in - Value in array
{ status: { $in: ['active', 'pending'] } }
// status is 'active' OR 'pending'

// $nin - Value not in array
{ role: { $nin: ['admin', 'moderator'] } }
// role is neither 'admin' nor 'moderator'

// $all - Array contains all values
{ tags: { $all: ['sports', 'tournament'] } }
// tags array must contain BOTH 'sports' and 'tournament'

// $elemMatch - Array element matches condition
{ scores: { $elemMatch: { $gt: 80 } } }
// At least one score is greater than 80

// $size - Array size
{ comments: { $size: 5 } }
// Array has exactly 5 elements
```

**Examples:**
```javascript
// Get matches of specific sports
const matches = await Match.find({
    sport: { $in: ['CRICKET', 'FOOTBALL', 'VOLLEYBALL'] }
});

// Get documents with 'urgent' tag
const urgent = await Task.find({
    tags: 'urgent'  // Automatically treats as array contains
});

// Get users who scored more than 90 in any exam
const highScorers = await Student.find({
    scores: { $elemMatch: { $gt: 90 } }
});
```

---

## Practical Examples

### Example 1: Get Matches with Filtering & Pagination

```javascript
// Controller function
exports.getAllMatches = async (req, res) => {
    try {
        // Get query parameters
        const { 
            sport,              // Filter by sport
            status,             // Filter by status
            limit = 10,
            page = 1,
            sortBy = 'scheduledAt'
        } = req.query;
        
        // Build query object
        const query = {};
        
        // Add filters
        if (sport) {
            query.sport = sport.toUpperCase();
        }
        if (status) {
            query.status = status.toUpperCase();
        }
        
        // Get total matching documents
        const total = await Match.countDocuments(query);
        
        // Get paginated results
        const matches = await Match.find(query)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo')
            .populate('winner', 'name shortCode')
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: matches.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: matches
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Postman:
// GET http://localhost:5000/api/matches?sport=CRICKET&status=COMPLETED&limit=5&page=1
```

### Example 2: Update Multiple Records

```javascript
// Mark all old matches as archived
exports.archiveOldMatches = async (req, res) => {
    try {
        // Update all matches before 2024
        const result = await Match.updateMany(
            {
                createdAt: { $lt: new Date('2024-01-01') }
            },
            {
                $set: { isArchived: true }
            }
        );
        
        res.status(200).json({
            success: true,
            message: `Archived ${result.modifiedCount} matches`
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

### Example 3: Complex Filtering

```javascript
// Get cricket matches between two dates, completed, with results
exports.getCricketResults = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const matches = await Match.find({
            sport: 'CRICKET',
            status: 'COMPLETED',
            scheduledAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
        .populate('teamA', 'name shortCode')
        .populate('teamB', 'name shortCode')
        .populate('winner', 'name shortCode')
        .sort({ scheduledAt: -1 });
        
        res.status(200).json({
            success: true,
            data: matches
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Postman:
// GET http://localhost:5000/api/cricket-results?startDate=2025-01-01&endDate=2025-12-31
```

---

## Postman Testing

### Test CREATE

```
POST http://localhost:5000/api/departments

Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "Computer Science",
  "shortCode": "CSE",
  "logo": "/uploads/cse.png"
}

Expected Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "645abc...",
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse.png",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Test READ

```
GET http://localhost:5000/api/departments/645abc...

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "645abc...",
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse.png",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Test UPDATE

```
PATCH http://localhost:5000/api/departments/645abc...

Body (JSON):
{
  "logo": "/uploads/cse-updated.png"
}

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "645abc...",
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse-updated.png",
    "updatedAt": "2025-01-15T10:15:00Z"  // Updated!
  }
}
```

### Test DELETE

```
DELETE http://localhost:5000/api/departments/645abc...

Expected Response (200 OK):
{
  "success": true,
  "message": "Department deleted successfully"
}
```

### Test Advanced Query

```
GET http://localhost:5000/api/matches?sport=CRICKET&status=COMPLETED&limit=5&page=1&sortBy=scheduledAt

Expected Response (200 OK):
{
  "success": true,
  "count": 5,
  "total": 15,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "...",
      "sport": "CRICKET",
      "status": "COMPLETED",
      "teamA": { ... },
      "teamB": { ... },
      "winner": { ... }
    },
    ...
  ]
}
```

---

## Summary

| Operation | Method | Returns | When to Use |
|-----------|--------|---------|------------|
| CREATE | `create()` | New document | Quick insert |
| CREATE | `new + save()` | New document | Custom validation |
| READ | `findById()` | Single doc | By ID |
| READ | `findOne()` | Single doc | By filter |
| READ | `find()` | Array | Multiple docs |
| UPDATE | `findByIdAndUpdate()` | Updated doc | By ID |
| UPDATE | `updateOne()` | Result object | Fast update |
| UPDATE | `updateMany()` | Result object | Bulk update |
| DELETE | `findByIdAndDelete()` | Deleted doc | By ID |
| DELETE | `deleteOne()` | Result object | Fast delete |
| DELETE | `deleteMany()` | Result object | Bulk delete |

---

## Next Steps

- 👉 Learn [Chapter 5: Routes and APIs](./05-ROUTES-AND-APIs.md) to expose these operations via HTTP
- 👉 See [Chapter 11: Postman Guide](./11-POSTMAN-API-TESTING.md) for testing
- 👉 Read [Chapter 12: Backend Building Guide](./12-BACKEND-BUILDING-GUIDE.md) for setup
