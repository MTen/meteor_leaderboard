PlayerList = new Mongo.Collection("players");

if(Meteor.isClient) {

    Meteor.subscribe('thePlayers');

    Template.leaderboard.helpers({
        // gets all the Players for the leader board
        'player': function(){
            // {} means return all
            // the second argument allows for filtering 1 asc, -1 desc
            return PlayerList.find( {}, {sort: {score: -1, name: 1} })

        },
        // conditional that adds the selected css class to any Player
        // that the user has selected
        'selectedClass': function(){
            var
                playerId = this._id,
                selectedPlayer = Session.get('selectedPlayer');

            if(playerId == selectedPlayer){
                return "selected"
            }
        },
        'showSelectedPlayer': function(){
            var selectedPlayer = Session.get('selectedPlayer');

            return PlayerList.findOne(selectedPlayer);
        }
    });

    Template.leaderboard.events({
        // when user clicks a player they are set as the selectedPlayer
        'click .player': function() {
           var playerID = this._id;
           Session.set('selectedPlayer', playerID);
        },
        'click .increment': function(){
            // get the player the user is highlighting
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('modifyPlayerScore', selectedPlayer, 1)
        },
        'click .decrement': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('modifyPlayerScore', selectedPlayer, -1)
        },
        'click .remove': function () {
            var selectedPlayer = Session.get('selectedPlayer');
            if(confirm("Do you want to delete this player?")) {
                Meteor.call('removePlayerData', selectedPlayer)
            }
        }
    });

    Template.addPlayerForm.events({
        'submit form': function (event) {
            event.preventDefault();

            var
                playerNameVar = event.target.playerName.value,
                playerScoreVar = parseInt(event.target.playerScore.value),
                currentUserId = Meteor.userId();

            PlayerList.insert({
                name: playerNameVar,
                score: playerScoreVar,
                createdBy: currentUserId
            });

            // reset state
            event.target.playerName.value = '';
            event.target.playerScore.value = 0;
            event.target.playerName.focus();

            Meteor.call('sendLogMessage');
            Meteor.call('insertPlayerData', playerNameVar, playerScoreVar);

        }
    });

    Template.self.helpers({
        'me': function(){
            return PlayerList.findOne({name: "Mike"})
        }
    })
}

if(Meteor.isServer){
    Meteor.publish('thePlayers', function(){
        var currentUserId = this.userId;
        return PlayerList.find({createdBy: currentUserId});
    })

    Meteor.methods({
        'sendLogMessage': function(){
            console.log("HI!");
        },

        'insertPlayerData': function(playerNameVar, playerScoreVar){
            var currentUserId = Meteor.userId();
            PlayerList.insert({
                name: playerNameVar,
                score: playerScoreVar,
                createdBy: currentUserId
            });
        },
        'removePlayerData': function(selectedPlayer){
            PlayerList.remove(selectedPlayer);
        },
        'modifyPlayerScore': function(selectedPlayer, scoreValue){
            PlayerList.update(selectedPlayer, {$inc: {score: scoreValue}})
        }

    });
}