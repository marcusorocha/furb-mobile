/* global app */

var playlistServiceImpl = function($q)
{
    return {
        playlists:
        [
            { title: 'Reggae', id: 1 },
            { title: 'Chill', id: 2 },
            { title: 'Dubstep', id: 3 },
            { title: 'Indie', id: 4 },
            { title: 'Rap', id: 5 },
            { title: 'Cowbell', id: 6 }
        ],

        getPlaylists: function ()
        {
            return this.playlists;
        },

        getPlaylist: function (playlistId)
        {
            var index = this.getPlaylistIndex(playlistId);

            if (index > -1)
                return angular.copy(this.playlists[index]);
            else
                return { };
        },

        getPlaylistIndex: function (playlistId)
        {
            var index = -1;

            for (var i in this.playlists)
	        {
	            if (this.playlists[i].id == playlistId)
	            {
	                index = i;
	            }
	        }

            return index;
        },

        putPlaylist: function (playlist)
        {
            if (playlist.id)
  			{
                  var index = this.getPlaylistIndex(playlist.id);

                  if (index > -1)
                      this.playlists[index] = angular.copy(playlist);
  			}
  			else
  			{
  				this.playlists.push(angular.copy(playlist));
  			}
      }
    }
};

var userServiceImpl = function()
{
    // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
    var setUser = function(user_data)
    {
        window.localStorage.starter_facebook_user = JSON.stringify(user_data);
    };

    var getUser = function()
    {
        return JSON.parse(window.localStorage.starter_facebook_user || '{}');
    };

    return {
        getUser: getUser,
        setUser: setUser
    };
};

app.service('PlaylistService', playlistServiceImpl);
app.service('UserService', userServiceImpl);
