extends Area2D

var missile_speed = 500
var missile_total_life_time = 10
var missile_life = 0.0

func _ready():
	add_to_group("missiles")


func _physics_process(delta):
	position += Vector2.UP.rotated(rotation) * missile_speed * delta
	missile_life += delta
	if missile_life > missile_total_life_time:
		queue_free()


func _on_area_entered(area):
	if area.is_in_group("enemies"):
		queue_free()
