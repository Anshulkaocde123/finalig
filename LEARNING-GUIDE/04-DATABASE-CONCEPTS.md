# Chapter 4: Database Concepts with MongoDB 🍃

## Table of Contents
1. [What is a Database?](#what-is-a-database)
2. [SQL vs NoSQL](#sql-vs-nosql)
3. [MongoDB Fundamentals](#mongodb-fundamentals)
4. [Mongoose - Object Data Modeling](#mongoose---object-data-modeling)
5. [Creating Schemas](#creating-schemas)
6. [Data Types and Validations](#data-types-and-validations)
7. [Relationships and References](#relationships-and-references)
8. [CRUD Operations](#crud-operations)
9. [Practical Examples from Our App](#practical-examples-from-our-app)
10. [Indexing and Performance](#indexing-and-performance)
11. [Common Patterns](#common-patterns)

---

## What is a Database?

A database is an **organized collection of structured data** that can be efficiently stored, retrieved, and modified.

### Real-World Analogy

```
🏥 Hospital Database
├── Patients Collection
│   ├── Patient 1: {name, age, blood_type, medical_history}
│   ├── Patient 2: {name, age, blood_type, medical_history}
│   └── Patient 3: {name, age, blood_type, medical_history}
├── Doctors Collection
│   ├── Doctor 1: {name, specialization, years_exp}
│   └── Doctor 2: {name, specialization, years_exp}
└── Appointments Collection
    ├── Appointment 1: {patient_id, doctor_id, date, time}
    └── Appointment 2: {patient_id, doctor_id, date, time}
```

### Key Benefits of Databases
- **Persistence**: Data survives after program ends
- **Organization**: Structured data retrieval
- **Scalability**: Handle millions of records
- **Relationships**: Connect related data
- **Security**: Control who accesses data
- **Consistency**: Ensure data accuracy

---

## SQL vs NoSQL

### SQL Databases (MySQL, PostgreSQL)

**Structure:** Fixed schema with tables and rows

```sql
-- SQL: Departments Table (Fixed structure)
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    shortCode VARCHAR(10) NOT NULL UNIQUE,
    logo VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name, shortCode, logo)
VALUES ('Computer Science', 'CSE', '/uploads/cse.png');

SELECT * FROM departments WHERE shortCode = 'CSE';
```

**Characteristics:**
- ✅ **ACID properties** (Atomicity, Consistency, Isolation, Durability)
- ✅ **Data integrity** through constraints
- ✅ **Complex joins** across multiple tables
- ❌ **Rigid schema** - hard to modify structure
- ❌ **Vertical scaling** - more expensive to scale up

### NoSQL Databases (MongoDB)

**Structure:** Flexible schema with collections and documents (JSON-like)

```javascript
// MongoDB: departments Collection (Flexible structure)
db.departments.insertOne({
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "Computer Science",
    shortCode: "CSE",
    logo: "/uploads/cse.png",
    createdAt: ISODate("2025-01-01T10:00:00Z"),
    // Can add new fields anytime!
    website: "https://cse.vnit.edu.in",
    studentCount: 120
});

db.departments.findOne({ shortCode: "CSE" });
```

**Characteristics:**
- ✅ **Flexible schema** - easy to add fields
- ✅ **Horizontal scaling** - add more servers
- ✅ **Fast reads/writes** for simple queries
- ✅ **Nested data** support
- ❌ **Limited transactions** (improved in recent versions)
- ❌ **Denormalization** can lead to data duplication

### Comparison Table

```
┌──────────────────────┬─────────────────────┬────────────────────┐
│ Feature              │ SQL (MySQL)         │ NoSQL (MongoDB)    │
├──────────────────────┼─────────────────────┼────────────────────┤
│ Schema               │ Fixed               │ Flexible           │
│ Scaling              │ Vertical            │ Horizontal         │
│ Data Format          │ Tables/Rows         │ Documents/JSON     │
│ Relationships        │ Foreign Keys        │ References         │
│ Transactions         │ Strong ACID         │ Multi-doc ACID     │
│ Query Language       │ SQL                 │ Query Objects      │
│ Good For             │ Complex Relations   │ Flexible Data      │
└──────────────────────┴─────────────────────┴────────────────────┘
```

---

## MongoDB Fundamentals

### MongoDB Hierarchy

```
MongoDB Server
└── Database (vnit-ig-app)
    ├── Collection (departments)
    │   ├── Document { _id, name, shortCode, logo, ... }
    │   ├── Document { _id, name, shortCode, logo, ... }
    │   └── Document { _id, name, shortCode, logo, ... }
    ├── Collection (matches)
    │   ├── Document { _id, sport, teamA, teamB, ... }
    │   └── Document { _id, sport, teamA, teamB, ... }
    ├── Collection (seasons)
    └── Collection (users)
        └── Document { _id, email, password, ... }
```

### Core Concepts

#### 1. **Document**
A single record in MongoDB (JSON-like object)

```javascript
// Example Document
{
    "_id": ObjectId("507f1f77bcf86cd799439011"),  // Unique identifier
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse.png",
    "createdAt": ISODate("2025-01-01T10:00:00Z"),
    "updatedAt": ISODate("2025-01-15T15:30:00Z")
}
```

#### 2. **Collection**
Group of related documents (like a table in SQL)

```javascript
// departments collection contains all department documents
db.departments.find();  // Gets all documents in collection
```

#### 3. **Database**
Container for multiple collections

```javascript
// Connection string specifies database
mongodb://localhost:27017/vnit-ig-app
                                      └─ Database name
```

#### 4. **_id Field**
Unique identifier automatically created by MongoDB

```javascript
// Types of _id
{ _id: ObjectId("507f1f77bcf86cd799439011") }  // Default
{ _id: "unique-string-id" }                      // Custom String
{ _id: 12345 }                                   // Custom Number
```

### Document Structure Example

```javascript
// Real document from our app (Department)
{
    "_id": ObjectId("645abc123def456789ghijkl"),
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/departments/cse.png",
    "createdAt": ISODate("2025-01-01T10:00:00Z"),
    "updatedAt": ISODate("2025-01-15T15:30:00Z"),
    "__v": 0  // Version field (Mongoose)
}
```

---

## Mongoose - Object Data Modeling

**Mongoose** = Bridge between Node.js and MongoDB

### Why Mongoose?

#### Without Mongoose (Raw MongoDB):
```javascript
// Complex, error-prone
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');

async function addDepartment() {
    try {
        const db = client.db('vnit-ig-app');
        const result = await db.collection('departments').insertOne({
            name: 'Computer Science',
            shortCode: 'CSE'
        });
        // No validation - could insert invalid data
        // Manual error handling needed
        console.log(result.insertedId);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
```

#### With Mongoose (Recommended):
```javascript
// Simple, with validation
const Department = require('./models/Department');

async function addDepartment() {
    const dept = new Department({
        name: 'Computer Science',
        shortCode: 'CSE'
    });
    
    await dept.save();  // Mongoose validates before saving
    // If data is invalid, error is thrown
    // Much cleaner!
}
```

### Mongoose Benefits

| Feature | Benefit |
|---------|---------|
| **Schema** | Defines structure, validates data |
| **Validation** | Ensures data integrity |
| **Middleware** | Run code before/after operations |
| **Methods** | Add custom functions to models |
| **Population** | Easy relationship management |
| **Indexing** | Optimize query performance |

---

## Creating Schemas

### Schema Basics

```javascript
const mongoose = require('mongoose');

// Step 1: Define Schema (Blueprint)
const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,        // Field is mandatory
        unique: true,          // No duplicates allowed
        trim: true            // Remove whitespace
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true       // Auto convert to uppercase
    },
    logo: {
        type: String,
        default: ''           // Default value if not provided
    }
}, {
    // Schema Options
    timestamps: true          // Adds createdAt & updatedAt fields
});

// Step 2: Create Model from Schema
const Department = mongoose.model('Department', departmentSchema);
//                             └─ Model name (singular, capitalized)
//                             MongoDB creates collection: "departments" (plural, lowercase)

module.exports = Department;
```

### Line-by-Line Explanation

```javascript
const mongoose = require('mongoose');
// Import mongoose library

const departmentSchema = new mongoose.Schema({
// Create a new schema object

    name: {
        // Define field 'name'
        type: String,
        // Data type must be String
        
        required: true,
        // This field MUST be provided
        // If missing, Mongoose throws error:
        // "Department validation failed: name: Path `name` is required."
        
        required: [true, 'Department name is required'],
        // Custom error message
        
        unique: true,
        // No two documents can have same name
        // Creates an index for faster queries
        
        trim: true,
        // Automatically removes whitespace
        // "  CSE  " → "CSE"
        
        lowercase: true,
        // Converts to lowercase
        // "CSE" → "cse"
        
        minlength: 3,
        // Minimum 3 characters
        
        maxlength: 100
        // Maximum 100 characters
    }
    
}, {
    // SCHEMA OPTIONS (Second parameter)
    
    timestamps: true,
    // Automatically creates:
    // - createdAt: Date of creation
    // - updatedAt: Date of last update
    
    strict: true,
    // Only allow fields defined in schema
    // Extra fields are ignored
    
    versionKey: false
    // Don't include __v field (Mongoose version)
});

const Department = mongoose.model('Department', departmentSchema);
// Create model named 'Department'
// Uses the schema defined above
// MongoDB will create 'departments' collection (lowercase, plural)
```

### Creating Documents with Schema

```javascript
const Department = require('./models/Department');

// Method 1: Using Model Constructor
async function createDept1() {
    const dept = new Department({
        name: 'Computer Science',
        shortCode: 'CSE',
        logo: '/uploads/cse.png'
    });
    
    // Validate before saving
    const validationError = dept.validateSync();
    if (validationError) {
        console.error('Validation error:', validationError);
    }
    
    // Save to database
    const savedDept = await dept.save();
    console.log('Saved:', savedDept._id);
}

// Method 2: Using create() method (faster)
async function createDept2() {
    const dept = await Department.create({
        name: 'Computer Science',
        shortCode: 'CSE',
        logo: '/uploads/cse.png'
    });
    console.log('Created:', dept._id);
}

// Method 3: Handle validation errors
async function createDeptWithErrors() {
    try {
        const dept = await Department.create({
            name: 'CSE'  // Missing shortCode!
        });
    } catch (error) {
        // Mongoose throws validation error
        console.error('Error:', error.message);
        // Output: "Department validation failed: shortCode: Path `shortCode` is required."
        
        // Get specific field errors
        Object.keys(error.errors).forEach(field => {
            console.log(`${field}: ${error.errors[field].message}`);
        });
    }
}
```

---

## Data Types and Validations

### Mongoose Data Types

```javascript
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
    // String
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    
    // Number
    studentCount: {
        type: Number,
        min: 0,
        max: 10000,
        default: 0
    },
    
    // Boolean
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Date
    establishedDate: {
        type: Date,
        default: Date.now  // Current timestamp
    },
    
    // Array of Strings
    tags: [String],
    // Usage: { tags: ['engineering', 'top-college'] }
    
    // Array of Numbers
    scores: [Number],
    // Usage: { scores: [85, 90, 88] }
    
    // Array of Objects
    achievements: [{
        year: Number,
        title: String,
        description: String
    }],
    
    // ObjectId (Reference to another document)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // References User model
    },
    
    // Nested Object
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: Number
    },
    
    // Enum (Limited values)
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
        default: 'ACTIVE'
    },
    
    // Mixed (Any type - avoid when possible)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});
```

### Validation Examples

```javascript
// 1. Built-in Validators
const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,  // Email validation regex
        lowercase: true,
        unique: true
    },
    
    age: {
        type: Number,
        min: [15, 'Age must be at least 15'],
        max: [45, 'Age cannot exceed 45']
    },
    
    gpa: {
        type: Number,
        min: 0,
        max: 4.0,
        validate: {
            validator: function(value) {
                return value % 0.01 === 0;  // 2 decimal places
            },
            message: 'GPA must have maximum 2 decimal places'
        }
    }
});

// 2. Custom Validators
const userSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate: {
            validator: function(password) {
                // Must contain at least one uppercase, one number
                return /[A-Z]/.test(password) && /[0-9]/.test(password);
            },
            message: 'Password must contain uppercase and number'
        }
    },
    
    confirmPassword: {
        type: String,
        validate: {
            validator: function(value) {
                // Confirm password matches password field
                return value === this.password;
            },
            message: 'Passwords do not match'
        }
    }
});

// 3. Async Validators
const departmentSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        sparse: true,  // Allow multiple null values
        validate: {
            validator: async function(code) {
                // Check if code exists in external system
                const result = await checkCodeInUniversity(code);
                return result.exists;
            },
            message: 'Code does not exist in university database'
        }
    }
});
```

---

## Relationships and References

### Types of Relationships

#### 1. One-to-Many (Most Common)
One department has many students

```javascript
// Department Model
const departmentSchema = new mongoose.Schema({
    name: String,
    code: String
    // No need to store students array here
});

// Student Model
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'  // Reference to Department
    }
});

// Usage
const student = await Student.findById(studentId)
    .populate('department');  // Fetch department details
    
// Result:
// {
//     _id: "...",
//     name: "Rahul",
//     department: {
//         _id: "...",
//         name: "Computer Science",
//         code: "CSE"
//     }
// }
```

#### 2. Many-to-Many
Students have many courses, courses have many students

```javascript
// Course Model
const courseSchema = new mongoose.Schema({
    title: String,
    code: String,
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

// Student Model
const studentSchema = new mongoose.Schema({
    name: String,
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

// Usage
const course = await Course.findById(courseId)
    .populate('students', 'name email');
```

#### 3. Embedded Documents (Denormalization)
For small, frequently accessed data

```javascript
// User Model with embedded address
const userSchema = new mongoose.Schema({
    name: String,
    // Embed entire address object
    address: {
        street: String,
        city: String,
        zip: Number
    },
    // Embed array of objects
    phone_numbers: [{
        type: {
            type: String,
            enum: ['mobile', 'home', 'office']
        },
        number: String
    }]
});

// Usage
const user = await User.findById(userId);
console.log(user.address.city);  // Direct access
console.log(user.phone_numbers[0].number);
```

### Real Example from Our App: Match Model

```javascript
// Match references Department documents
const matchSchema = new mongoose.Schema({
    sport: String,
    
    // Reference to Department (one team)
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    
    // Reference to another Department (other team)
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    
    // Reference to winning Department
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    
    // Reference to Season
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        default: null
    }
});

// Usage - Populate all references
const match = await Match.findById(matchId)
    .populate('teamA', 'name shortCode logo')  // Select specific fields
    .populate('teamB', 'name shortCode logo')
    .populate('winner', 'name shortCode logo')
    .populate('season', 'name year');

// Result:
// {
//     _id: "...",
//     sport: "CRICKET",
//     teamA: { _id: "...", name: "CSE", shortCode: "CSE", logo: "..." },
//     teamB: { _id: "...", name: "ECE", shortCode: "ECE", logo: "..." },
//     winner: { _id: "...", name: "CSE", shortCode: "CSE", logo: "..." },
//     season: { _id: "...", name: "VNIT Inter-Department Games 2025", year: 2025 }
// }
```

---

## CRUD Operations

CRUD = Create, Read, Update, Delete

### CREATE Operations

```javascript
const Department = require('../models/Department');

// Method 1: new + save()
async function createDepartment1() {
    const dept = new Department({
        name: 'Computer Science',
        shortCode: 'CSE',
        logo: '/uploads/cse.png'
    });
    
    const savedDept = await dept.save();
    console.log('Saved Department ID:', savedDept._id);
    return savedDept;
}

// Method 2: create() - Direct method
async function createDepartment2() {
    const dept = await Department.create({
        name: 'Electrical Engineering',
        shortCode: 'EE',
        logo: '/uploads/ee.png'
    });
    
    return dept;
}

// Method 3: insertMany() - Multiple documents
async function createMultipleDepartments() {
    const departments = await Department.insertMany([
        { name: 'Computer Science', shortCode: 'CSE' },
        { name: 'Electrical Engineering', shortCode: 'EE' },
        { name: 'Civil Engineering', shortCode: 'CE' }
    ]);
    
    console.log(`Created ${departments.length} departments`);
    return departments;
}
```

### READ Operations

```javascript
const Department = require('../models/Department');

// 1. Find by ID
async function getDepartmentById(id) {
    const dept = await Department.findById(id);
    // Returns document or null if not found
    return dept;
}

// 2. Find One (first match)
async function findDepartmentByCode(code) {
    const dept = await Department.findOne({ shortCode: code });
    return dept;
}

// 3. Find Many
async function getAllDepartments() {
    const departments = await Department.find();
    return departments;
}

// 4. Find with Filters
async function findDepartmentsWithFilters() {
    const departments = await Department.find({
        name: { $regex: 'Computer', $options: 'i' }  // Case-insensitive search
    });
    return departments;
}

// 5. Find with Sorting and Pagination
async function getDepartmentsWithPagination(page = 1, limit = 10) {
    const departments = await Department.find()
        .sort({ createdAt: -1 })  // -1 = descending, 1 = ascending
        .skip((page - 1) * limit)  // Skip documents
        .limit(limit)              // Limit results
        .select('name shortCode logo');  // Select specific fields
    
    const total = await Department.countDocuments();
    
    return {
        data: departments,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
}

// 6. Count Documents
async function countDepartments() {
    const count = await Department.countDocuments();
    return count;
}

// 7. Exists Check
async function departmentExists(code) {
    const exists = await Department.exists({ shortCode: code });
    return exists;  // Returns { _id: ... } or null 
}
```

### UPDATE Operations

```javascript
const Department = require('../models/Department');

// Method 1: findByIdAndUpdate() - Returns updated document
async function updateDepartmentById(id, updateData) {
    const dept = await Department.findByIdAndUpdate(
        id,
        updateData,
        { 
            new: true,              // Return updated document
            runValidators: true     // Run schema validators
        }
    );
    
    return dept;
}

// Method 2: findOneAndUpdate() - More flexible
async function updateDepartmentByCode(code, updateData) {
    const dept = await Department.findOneAndUpdate(
        { shortCode: code },
        updateData,
        { new: true, runValidators: true }
    );
    
    return dept;
}

// Method 3: updateOne() - Doesn't return document
async function quickUpdate(id, updateData) {
    const result = await Department.updateOne(
        { _id: id },
        { $set: updateData }  // Only update specified fields
    );
    
    return result;
    // { acknowledged: true, modifiedCount: 1, upsertedId: null }
}

// Method 4: updateMany() - Update multiple documents
async function updateMultipleDepartments(filter, updateData) {
    const result = await Department.updateMany(
        filter,
        { $set: updateData }
    );
    
    return result;
}

// Method 5: Replace entire document
async function replaceDepartment(id, newData) {
    const dept = await Department.replaceOne(
        { _id: id },
        newData
    );
    
    return dept;
}

// Update Operators
async function updateOperatorsExample(id) {
    // $set - Set field value
    await Department.findByIdAndUpdate(id, {
        $set: { logo: '/new-logo.png' }
    });
    
    // $unset - Remove field
    await Department.findByIdAndUpdate(id, {
        $unset: { obsoleteField: 1 }
    });
    
    // $inc - Increment value
    await Department.findByIdAndUpdate(id, {
        $inc: { studentCount: 10 }  // Increase by 10
    });
    
    // $push - Add to array
    await Department.findByIdAndUpdate(id, {
        $push: { achievements: 'New Award 2025' }
    });
    
    // $pull - Remove from array
    await Department.findByIdAndUpdate(id, {
        $pull: { achievements: 'Old Award' }
    });
}
```

### DELETE Operations

```javascript
const Department = require('../models/Department');

// Method 1: findByIdAndDelete() - Returns deleted document
async function deleteDepartmentById(id) {
    const dept = await Department.findByIdAndDelete(id);
    return dept;  // Returns deleted document or null
}

// Method 2: findOneAndDelete() - More flexible
async function deleteDepartmentByCode(code) {
    const dept = await Department.findOneAndDelete({ shortCode: code });
    return dept;
}

// Method 3: deleteOne() - Delete first match
async function deleteFirstMatch(filter) {
    const result = await Department.deleteOne(filter);
    return result;
    // { acknowledged: true, deletedCount: 1 }
}

// Method 4: deleteMany() - Delete multiple
async function deleteMultiple(filter) {
    const result = await Department.deleteMany(filter);
    return result;
}

// Practical Example - Delete with validation
async function safeDeleteDepartment(id) {
    // Check if department has any students
    const Student = require('./Student');
    const studentCount = await Student.countDocuments({ department: id });
    
    if (studentCount > 0) {
        throw new Error(`Cannot delete department with ${studentCount} students`);
    }
    
    // Safe to delete
    await Department.findByIdAndDelete(id);
    return { success: true };
}
```

---

## Practical Examples from Our App

### Example 1: Department Model

File: `server/models/Department.js`

```javascript
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    // FIELD 1: Department Name
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,           // No duplicate names
        trim: true,             // Remove whitespace
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    // FIELD 2: Short Code (e.g., CSE, ECE)
    shortCode: {
        type: String,
        required: [true, 'Short code is required'],
        unique: true,
        trim: true,
        uppercase: true,        // Auto-convert to uppercase
        maxlength: [10, 'Code cannot exceed 10 characters']
    },
    
    // FIELD 3: Department Logo URL
    logo: {
        type: String,
        default: ''             // Empty string if not provided
    }
}, {
    timestamps: true            // Auto creates createdAt & updatedAt
});

module.exports = mongoose.model('Department', departmentSchema);
```

### Example 2: Match Model (Complex)

File: `server/models/Match.js`

```javascript
const mongoose = require('mongoose');

// Define allowed sports and statuses
const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL',
                'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];
const MATCH_STATUS = ['SCHEDULED', 'LIVE', 'COMPLETED'];

const baseMatchSchema = new mongoose.Schema({
    // FIELD 1: Sport Type
    sport: {
        type: String,
        required: [true, 'Sport is required'],
        enum: {
            values: SPORTS,
            message: `Sport must be one of: ${SPORTS.join(', ')}`
        }
    },
    
    // FIELD 2: Team A (Reference to Department)
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',      // Links to Department model
        required: [true, 'Team A is required']
    },
    
    // FIELD 3: Team B (Reference to Department)
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Team B is required']
    },
    
    // FIELD 4: Winner (Optional reference to Department)
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null           // Null until match is completed
    },
    
    // FIELD 5: Match Status
    status: {
        type: String,
        enum: MATCH_STATUS,
        default: 'SCHEDULED'
    },
    
    // FIELD 6: Scheduled Time
    scheduledAt: {
        type: Date,
        default: null
    },
    
    // FIELD 7: Match Venue
    venue: {
        type: String,
        default: null,
        maxlength: [200, 'Venue cannot exceed 200 characters']
    },
    
    // FIELD 8: Season Reference
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        default: null
    },
    
    // FIELD 9: Match Type
    matchType: {
        type: String,
        enum: ['REGULAR', 'SEMIFINAL', 'FINAL'],
        default: 'REGULAR'
    }
}, {
    timestamps: true,
    discriminatorKey: 'matchType'
});

module.exports = mongoose.model('Match', baseMatchSchema);
```

### Example 3: Finding Data

From `server/controllers/matchController.js`:

```javascript
// GET all matches with advanced filtering
async function getAllMatches(req, res) {
    const { sport, status, limit = 50, page = 1 } = req.query;
    
    // Build query object
    const query = {};
    
    if (sport) {
        query.sport = sport.toUpperCase();
    }
    
    if (status) {
        query.status = status.toUpperCase();
    }
    
    // Execute query with population
    const matches = await Match.find(query)
        .populate('teamA', 'name shortCode logo')   // Get team details
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo')
        .populate('season', 'name year')
        .sort({ scheduledAt: -1 })                 // Sort by date
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Match.countDocuments(query);
    
    return {
        success: true,
        data: matches,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
    };
}
```

---

## Indexing and Performance

### Why Indexing Matters

```javascript
// WITHOUT INDEX
// Database must scan ALL documents
db.users.find({ email: "student@vnit.edu.in" })  // Scans 10,000 documents ❌

// WITH INDEX
// Database uses index (like book index)
db.users.find({ email: "student@vnit.edu.in" })  // Finds in milliseconds ✅
```

### Creating Indexes

```javascript
const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,           // Automatically creates index
        sparse: true            // Allow multiple null values
    },
    
    rollNumber: {
        type: String,
        index: true             // Create index on this field
    }
});

// Compound index (multiple fields)
studentSchema.index({ email: 1, department: 1 });

// Text index (for search)
studentSchema.index({ name: 'text', bio: 'text' });

// TTL index (auto-delete after time)
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

### Index Best Practices

```
✅ DO:
- Index frequently queried fields
- Index fields used in sorts
- Index fields in { $where, $in } queries
- Limit indexes (each index slows inserts)

❌ DON'T:
- Index every field
- Create multiple indexes on same field
- Index fields with low cardinality (few unique values)
```

---

## Common Patterns

### Pattern 1: Soft Delete

```javascript
const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    
    // Instead of deleting, mark as deleted
    deletedAt: {
        type: Date,
        default: null
    }
});

// Find only active (not deleted)
articleSchema.query.active = function() {
    return this.where({ deletedAt: null });
};

// Usage
const articles = await Article.find().active();
```

### Pattern 2: Audit Trail

```javascript
const documentSchema = new mongoose.Schema({
    title: String,
    content: String,
    
    // Track changes
    history: [{
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changes: Object
    }]
});
```

### Pattern 3: Denormalization for Performance

```javascript
// Store redundant data for faster queries
const postSchema = new mongoose.Schema({
    title: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Denormalized author info (redundant but faster)
    authorName: String,
    authorEmail: String,
    
    // Denormalized stats
    commentCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 }
});
```

---

## Summary

| Concept | What | Why |
|---------|------|-----|
| **Database** | Organized data storage | Persistence and scalability |
| **MongoDB** | NoSQL database | Flexible schema, horizontal scaling |
| **Mongoose** | ODM for MongoDB | Validation, relationships, simplicity |
| **Schema** | Data blueprint | Structure and validation |
| **Model** | MongoDB interface | CRUD operations |
| **Document** | Single record | Basic data unit |
| **Collection** | Document group | Like SQL table |
| **Reference** | Link to other doc | Maintain relationships |
| **Indexing** | Fast lookup | Performance |

---

## Next Steps

- 👉 Read [Chapter 5: Routes and APIs](./05-ROUTES-AND-APIs.md) to learn how to expose database operations via HTTP endpoints
- 👉 Read [Chapter 12: Database Operations Guide](./12-DATABASE-OPERATIONS-GUIDE.md) for detailed CRUD examples
