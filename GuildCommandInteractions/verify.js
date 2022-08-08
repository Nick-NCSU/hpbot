const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder } = require("@discordjs/builders");
const { EmbedBuilder, ButtonStyle } = require("discord.js");
const tokens = require("../index.js");

/**
 * Function to link Discord account and SRC account
 */
module.exports = {
    /**
     * Builds /verify [username:string]
     */
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Link your Discord account to your SRC account.")
        .addStringOption(option =>
            option.setName("username")
                .setDescription("Speedrun.com username")
                .setRequired(true)
        ),
    async execute(params) {
        const { interaction, client } = params;
        const channel = await client.channels.cache.get("815040942930919425");
        const username = interaction.options.get("username").value;
        const isVerified = !!(await tokens.db.db("accounts").collection("users").findOne({
            discordID: interaction.user.id
        }));
        if(isVerified) {
            await interaction.editReply({
                content: "You are already verified. Please contact <@168420049462362112> if this is a mistake or to unverify."
            });
            return;
        }
        const srcAccount = await tokens.fetch(`https://www.speedrun.com/api/v1/users/${username}`);
        if(!srcAccount.data) {
            interaction.editReply({
                content: `User ${username} not found.`
            });
            return;
        }

        let date = new Date().toISOString().slice(0, 10);
        let embed = new EmbedBuilder()
            .setColor("#118855")
            .setTitle("User Requesting Verification")
            .setFooter({ text: `${date}` })
            .setThumbnail(srcAccount.data.assets.image.uri)
            .addFields([
                { name: "User:", value: `<@${interaction.user.id}>` },
                { name: "Tag:", value: interaction.user.tag },
                { name: "Speedrun.com account:", value: `[${srcAccount.data.names.international}](${srcAccount.data.weblink})`}
            ]);
        const verifyId = JSON.stringify({
            discordID: interaction.user.id,
            srcID: srcAccount.data.id,
            customId: "verify",
        });
        const rejectId = JSON.stringify({
            customId: "reject"
        });
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(verifyId)
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(rejectId)
                    .setLabel("Reject")
                    .setStyle(ButtonStyle.Danger),
            );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({
            content: "Your request has been submitted. You will receive the verified role when reviewed."
        });
    },
};