const About = require('../models/About');

// Get about page content
exports.getAbout = async (req, res) => {
    try {
        let about = await About.findOne();
        
        if (!about) {
            // Create default about page
            about = new About({
                title: 'About VNIT Inter-Department Games',
                description: 'VNIT Inter-Department Games is a premier sporting event...',
                missionStatement: 'To promote sports and healthy competition among students',
                visionStatement: 'To create a vibrant sporting culture in VNIT'
            });
            await about.save();
        }

        res.json({
            success: true,
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update about page content
exports.updateAbout = async (req, res) => {
    try {
        const { title, description, missionStatement, visionStatement, history, highlights, logoUrl, bannerUrl, contactEmail, contactPhone } = req.body;

        let about = await About.findOne();

        if (!about) {
            about = new About({
                title,
                description,
                missionStatement,
                visionStatement,
                history,
                highlights,
                logoUrl,
                bannerUrl,
                contactEmail,
                contactPhone
            });
        } else {
            about.title = title || about.title;
            about.description = description || about.description;
            about.missionStatement = missionStatement || about.missionStatement;
            about.visionStatement = visionStatement || about.visionStatement;
            about.history = history || about.history;
            about.highlights = highlights || about.highlights;
            about.logoUrl = logoUrl || about.logoUrl;
            about.bannerUrl = bannerUrl || about.bannerUrl;
            about.contactEmail = contactEmail || about.contactEmail;
            about.contactPhone = contactPhone || about.contactPhone;
        }

        await about.save();

        res.json({
            success: true,
            data: about,
            message: 'About page updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
