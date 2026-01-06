const ScoringPreset = require('../models/ScoringPreset');

// @desc    Create scoring preset
// @route   POST /api/scoring-presets
// @access  Private
const createScoringPreset = async (req, res) => {
    try {
        const { sport, name, description, winPoints, lossPoints, drawPoints, bonusPoints, dominantVictoryMargin, matchTypeMultipliers, sportSpecificRules, isDefault } = req.body;

        // If setting as default, remove default from others in same sport
        if (isDefault) {
            await ScoringPreset.updateMany(
                { sport, isDefault: true },
                { isDefault: false }
            );
        }

        const preset = await ScoringPreset.create({
            sport,
            name,
            description,
            winPoints: winPoints || 10,
            lossPoints: lossPoints || 0,
            drawPoints: drawPoints || 5,
            bonusPoints: bonusPoints || 0,
            dominantVictoryMargin: dominantVictoryMargin || null,
            matchTypeMultipliers: matchTypeMultipliers || { regular: 1, semifinal: 1.5, final: 2 },
            sportSpecificRules: sportSpecificRules || {},
            isDefault: isDefault || false,
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: preset
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all scoring presets
// @route   GET /api/scoring-presets
// @access  Public
const getScoringPresets = async (req, res) => {
    try {
        const { sport, active, isDefault } = req.query;
        let query = {};

        if (sport) query.sport = sport.toUpperCase();
        if (active === 'true') query.isActive = true;
        if (isDefault === 'true') query.isDefault = true;

        const presets = await ScoringPreset.find(query).sort({ sport: 1, name: 1 });

        res.json({
            success: true,
            data: presets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get default preset for sport
// @route   GET /api/scoring-presets/sport/:sport/default
// @access  Public
const getDefaultPreset = async (req, res) => {
    try {
        const preset = await ScoringPreset.findOne({
            sport: req.params.sport.toUpperCase(),
            isDefault: true
        });

        if (!preset) {
            return res.status(404).json({ message: 'No default preset found for this sport' });
        }

        res.json({
            success: true,
            data: preset
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get preset by ID
// @route   GET /api/scoring-presets/:id
// @access  Public
const getScoringPreset = async (req, res) => {
    try {
        const preset = await ScoringPreset.findById(req.params.id);

        if (!preset) {
            return res.status(404).json({ message: 'Preset not found' });
        }

        res.json({
            success: true,
            data: preset
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update scoring preset
// @route   PUT /api/scoring-presets/:id
// @access  Private
const updateScoringPreset = async (req, res) => {
    try {
        const { name, description, winPoints, lossPoints, drawPoints, bonusPoints, dominantVictoryMargin, matchTypeMultipliers, sportSpecificRules, isDefault, isActive } = req.body;

        let preset = await ScoringPreset.findById(req.params.id);

        if (!preset) {
            return res.status(404).json({ message: 'Preset not found' });
        }

        // If setting as default, remove default from others in same sport
        if (isDefault && !preset.isDefault) {
            await ScoringPreset.updateMany(
                { sport: preset.sport, _id: { $ne: req.params.id }, isDefault: true },
                { isDefault: false }
            );
        }

        Object.assign(preset, {
            name: name || preset.name,
            description: description !== undefined ? description : preset.description,
            winPoints: winPoints !== undefined ? winPoints : preset.winPoints,
            lossPoints: lossPoints !== undefined ? lossPoints : preset.lossPoints,
            drawPoints: drawPoints !== undefined ? drawPoints : preset.drawPoints,
            bonusPoints: bonusPoints !== undefined ? bonusPoints : preset.bonusPoints,
            dominantVictoryMargin: dominantVictoryMargin !== undefined ? dominantVictoryMargin : preset.dominantVictoryMargin,
            matchTypeMultipliers: matchTypeMultipliers || preset.matchTypeMultipliers,
            sportSpecificRules: sportSpecificRules || preset.sportSpecificRules,
            isDefault: isDefault !== undefined ? isDefault : preset.isDefault,
            isActive: isActive !== undefined ? isActive : preset.isActive
        });

        await preset.save();

        res.json({
            success: true,
            data: preset
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete scoring preset
// @route   DELETE /api/scoring-presets/:id
// @access  Private
const deleteScoringPreset = async (req, res) => {
    try {
        const preset = await ScoringPreset.findByIdAndDelete(req.params.id);

        if (!preset) {
            return res.status(404).json({ message: 'Preset not found' });
        }

        res.json({
            success: true,
            message: 'Preset deleted successfully',
            data: preset
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Duplicate preset
// @route   POST /api/scoring-presets/:id/duplicate
// @access  Private
const duplicateScoringPreset = async (req, res) => {
    try {
        const { newName } = req.body;
        const original = await ScoringPreset.findById(req.params.id);

        if (!original) {
            return res.status(404).json({ message: 'Preset not found' });
        }

        const newPreset = new ScoringPreset({
            sport: original.sport,
            name: newName || `${original.name} (Copy)`,
            description: original.description,
            winPoints: original.winPoints,
            lossPoints: original.lossPoints,
            drawPoints: original.drawPoints,
            bonusPoints: original.bonusPoints,
            dominantVictoryMargin: original.dominantVictoryMargin,
            matchTypeMultipliers: original.matchTypeMultipliers,
            sportSpecificRules: original.sportSpecificRules,
            isDefault: false,
            isActive: true
        });

        await newPreset.save();

        res.status(201).json({
            success: true,
            data: newPreset
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Calculate points for a completed match based on preset
// @route   POST /api/scoring-presets/calculate
// @access  Public
const calculateMatchPoints = async (req, res) => {
    try {
        const { sport, matchCategory, winnerId, loserId, scoreDiff, isDraw } = req.body;

        // Get default preset for sport
        const preset = await ScoringPreset.findOne({
            sport: sport.toUpperCase(),
            isDefault: true,
            isActive: true
        });

        if (!preset) {
            return res.status(404).json({ 
                message: 'No default preset found for this sport',
                suggestion: 'Create a default scoring preset first'
            });
        }

        // Calculate base points
        let winnerPoints = isDraw ? preset.drawPoints : preset.winPoints;
        let loserPoints = isDraw ? preset.drawPoints : preset.lossPoints;

        // Apply match type multiplier
        const matchTypeKey = (matchCategory || 'REGULAR').toLowerCase();
        const multiplier = preset.matchTypeMultipliers?.[matchTypeKey] || 1;
        winnerPoints = Math.round(winnerPoints * multiplier);
        loserPoints = Math.round(loserPoints * multiplier);

        // Apply bonus for dominant victory
        if (!isDraw && preset.bonusPoints && preset.dominantVictoryMargin) {
            if (scoreDiff >= preset.dominantVictoryMargin) {
                winnerPoints += preset.bonusPoints;
            }
        }

        res.json({
            success: true,
            data: {
                preset: preset.name,
                sport,
                matchCategory,
                winnerPoints: isDraw ? null : winnerPoints,
                loserPoints: isDraw ? null : loserPoints,
                drawPoints: isDraw ? winnerPoints : null,
                multiplierApplied: multiplier,
                bonusApplied: scoreDiff >= (preset.dominantVictoryMargin || Infinity) ? preset.bonusPoints : 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed default presets for all sports
// @route   POST /api/scoring-presets/seed-defaults
// @access  Private
const seedDefaultPresets = async (req, res) => {
    try {
        const defaultPresets = [
            {
                sport: 'CRICKET',
                name: 'Standard Cricket',
                description: 'Standard cricket scoring - higher points for finals',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 5,
                bonusPoints: 2,
                dominantVictoryMargin: 50, // Win by 50+ runs
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 },
                sportSpecificRules: { overs: 20, extras: true }
            },
            {
                sport: 'FOOTBALL',
                name: 'Standard Football',
                description: 'Standard football scoring',
                winPoints: 3,
                lossPoints: 0,
                drawPoints: 1,
                bonusPoints: 0,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 }
            },
            {
                sport: 'BASKETBALL',
                name: 'Standard Basketball',
                description: 'Basketball scoring with bonus for large margins',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 0,
                bonusPoints: 2,
                dominantVictoryMargin: 20, // Win by 20+ points
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 }
            },
            {
                sport: 'BADMINTON',
                name: 'Standard Badminton',
                description: 'Badminton best-of-3 scoring',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 0,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 },
                sportSpecificRules: { maxSets: 3, pointsPerSet: 21 }
            },
            {
                sport: 'TABLE_TENNIS',
                name: 'Standard Table Tennis',
                description: 'Table tennis best-of-5 scoring',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 0,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 },
                sportSpecificRules: { maxSets: 5, pointsPerSet: 11 }
            },
            {
                sport: 'VOLLEYBALL',
                name: 'Standard Volleyball',
                description: 'Volleyball best-of-5 scoring',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 0,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 },
                sportSpecificRules: { maxSets: 5, pointsPerSet: 25 }
            },
            {
                sport: 'KABADDI',
                name: 'Standard Kabaddi',
                description: 'Kabaddi scoring',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 5,
                bonusPoints: 2,
                dominantVictoryMargin: 15,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 }
            },
            {
                sport: 'KHOKHO',
                name: 'Standard Kho-Kho',
                description: 'Kho-Kho scoring',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 5,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 }
            },
            {
                sport: 'CHESS',
                name: 'Standard Chess',
                description: 'Chess scoring',
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 5,
                matchTypeMultipliers: { regular: 1, semifinal: 1.5, final: 2 }
            }
        ];

        const created = [];
        const skipped = [];

        for (const presetData of defaultPresets) {
            const existing = await ScoringPreset.findOne({ 
                sport: presetData.sport, 
                isDefault: true 
            });

            if (existing) {
                skipped.push(presetData.sport);
                continue;
            }

            const preset = await ScoringPreset.create({
                ...presetData,
                isDefault: true,
                isActive: true
            });
            created.push(preset.sport);
        }

        res.status(201).json({
            success: true,
            message: `Created ${created.length} presets, skipped ${skipped.length}`,
            created,
            skipped
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createScoringPreset,
    getScoringPresets,
    getDefaultPreset,
    getScoringPreset,
    updateScoringPreset,
    deleteScoringPreset,
    duplicateScoringPreset,
    calculateMatchPoints,
    seedDefaultPresets
};
