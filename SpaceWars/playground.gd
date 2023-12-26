extends Node2D


var player_ship = load("res://player_ship.tscn")
var enemy_ship = load("res://enemy_ship.tscn")

var ememy_add_lag = 0.0
var new_player_ship

func _ready():
	new_player_ship = player_ship.instantiate()
	new_player_ship.position.x = 640
	new_player_ship.position.y = 360
	add_child(new_player_ship)

func _physics_process(delta):
	ememy_add_lag += delta
	if ememy_add_lag > 0.25:
		ememy_add_lag -= 0.25
		var enemies = get_tree().get_nodes_in_group("enemies")
		if enemies.size() < 7:
			var new_enemy_ship = enemy_ship.instantiate()
			new_enemy_ship.position.x = randf_range(0, 1280)
			new_enemy_ship.position.y = randf_range(0, 720)
			if new_enemy_ship.position.distance_to(new_player_ship.position) > 500:
				add_child(new_enemy_ship)
