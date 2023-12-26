extends Area2D

var ship_speed = 250

var missile_cooldown_time:float = 0.25
var missile_lag:float= 0.0

var missile = load("res://missile.tscn")
# Called when the node enters the scene tree for the first time.
func _ready():
	add_to_group("players")


func _physics_process(delta):
	var velocity = Vector2.ZERO
	
	if Input.is_action_pressed("go_right"):
		velocity.x += 1
	if Input.is_action_pressed("go_left"):
		velocity.x -= 1
	if Input.is_action_pressed("go_down"):
		velocity.y += 1
	if Input.is_action_pressed("go_up"):
		velocity.y -= 1

	if velocity.length() > 0:
		velocity = velocity.normalized() * ship_speed
		position += velocity * delta
	
	rotation = position.direction_to(get_viewport().get_mouse_position()).angle() + (PI/2)
	
	missile_lag += delta
	if missile_lag > missile_cooldown_time:
		missile_lag -= missile_cooldown_time
		
		var new_missile = missile.instantiate()
		new_missile.position = position + Vector2.UP.rotated(rotation) * 10
		new_missile.rotation = rotation
		get_node("/root/Playground").add_child(new_missile)


func _on_area_entered(area):
	if area.is_in_group("enemies"):
		get_tree().call_deferred("reload_current_scene")
