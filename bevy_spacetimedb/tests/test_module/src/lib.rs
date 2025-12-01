use spacetimedb::{table, reducer, ReducerContext, Table};

/// Simple test table for integration tests
#[table(name = test_player, public)]
pub struct TestPlayer {
    #[primary_key]
    pub id: u32,
    pub name: String,
}

/// Test reducer - creates a player
#[reducer]
pub fn create_player(ctx: &ReducerContext, id: u32, name: String) {
    ctx.db.test_player().insert(TestPlayer { id, name });
}

/// Test reducer - deletes a player
#[reducer]
pub fn delete_player(ctx: &ReducerContext, id: u32) {
    if let Some(player) = ctx.db.test_player().id().find(&id) {
        ctx.db.test_player().id().delete(&player.id);
    }
}

/// Test reducer - updates a player's name
#[reducer]
pub fn update_player(ctx: &ReducerContext, id: u32, name: String) {
    if let Some(player) = ctx.db.test_player().id().find(&id) {
        ctx.db.test_player().id().update(TestPlayer { id: player.id, name });
    }
}

/// Connection lifecycle reducer
#[reducer]
pub fn on_connect(ctx: &ReducerContext) {
    log::info!("Client connected: {:?}", ctx.sender);
}

/// Disconnection reducer
#[reducer]
pub fn on_disconnect(ctx: &ReducerContext) {
    log::info!("Client disconnected: {:?}", ctx.sender);
}
